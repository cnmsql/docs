import React, {useState, useEffect, useMemo, useRef} from 'react';
import clsx from 'clsx';
import {useDoc, useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {alignBlocks} from './blocks';
import {annotate} from './annotate';
import styles from './styles.module.css';

const DATA_BASE = '/versiondiff';
const MARKDOWN_SELECTOR = '.theme-doc-markdown';

function VersionDiffBar({docId, currentName}) {
  const dataUrl = useBaseUrl(`${DATA_BASE}/${docId}.json`);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [baseName, setBaseName] = useState(null);
  const [highlights, setHighlights] = useState(false);
  const [picking, setPicking] = useState(false);
  const [changeCounts, setChangeCounts] = useState({});
  const pickerRef = useRef(null);
  const computingRef = useRef(false);

  useEffect(() => {
    let live = true;
    fetch(dataUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!live) return;
        setData(json);
        setStatus('ready');
      })
      .catch(() => live && setStatus('empty'));
    return () => {
      live = false;
    };
  }, [dataUrl]);

  const versions = data?.versions ?? [];
  const currentIndex = versions.findIndex((v) => v.name === currentName);

  useEffect(() => {
    if (status === 'ready' && baseName == null && currentIndex >= 0) {
      const older = versions[currentIndex + 1];
      const fallback = versions.find((v) => v.name !== currentName);
      setBaseName((older ?? fallback)?.name ?? null);
    }
  }, [status, baseName, currentIndex, versions, currentName]);

  const current = versions[currentIndex];
  const base = versions.find((v) => v.name === baseName);

  const alignment = useMemo(
    () => (current && base ? alignBlocks(base.content, current.content) : null),
    [current, base],
  );

  useEffect(() => {
    if (!highlights || !alignment) return undefined;
    const container = document.querySelector(MARKDOWN_SELECTOR);
    if (!container) return undefined;

    let cleanupFn = annotate(
      container,
      alignment.items,
      alignment.removals,
      base.label,
      current.label,
      styles,
    );

    // React reconciliation (hydration, re-renders) may remove new DOM elements
    // we injected (cards, new-section headers). CSS classes on existing elements
    // survive, but freshly-created nodes are discarded. A MutationObserver on
    // container.childList catches removals of versiondiff cards and re-applies.
    let reapply = null;
    let applying = false;
    const observer = new MutationObserver((mutations) => {
      if (applying || reapply) return;
      const lost = mutations.some((m) =>
        Array.from(m.removedNodes).some(
          (n) => n.nodeType === 1 && n.dataset.versionDiff === 'card',
        ),
      );
      if (!lost) return;
      reapply = setTimeout(() => {
        reapply = null;
        applying = true;
        cleanupFn();
        cleanupFn = annotate(
          container,
          alignment.items,
          alignment.removals,
          base.label,
          current.label,
          styles,
        );
        applying = false;
      }, 50);
    });
    observer.observe(container, {childList: true});

    return () => {
      clearTimeout(reapply);
      observer.disconnect();
      cleanupFn();
    };
  }, [highlights, alignment, base, current, styles]);

  useEffect(() => {
    if (!picking) return undefined;
    const onClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPicking(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [picking]);

  // Lazy async change-count computation: kicks off when the picker opens and
  // yields between versions so the UI stays responsive.
  useEffect(() => {
    if (!picking || !current || computingRef.current) return;
    computingRef.current = true;

    let cancelled = false;
    const toCompute = versions.filter((v) => v.name !== currentName);

    const compute = (index) => {
      if (index >= toCompute.length || cancelled) {
        computingRef.current = false;
        return;
      }
      setTimeout(() => {
        if (cancelled) return;
        const v = toCompute[index];
        const result = alignBlocks(v.content, current.content);
        setChangeCounts((prev) => ({...prev, [v.name]: result.changed}));
        compute(index + 1);
      }, 0);
    };
    compute(0);

    return () => {
      cancelled = true;
      computingRef.current = false;
    };
  }, [picking, current, versions, currentName]);

  if (status !== 'ready' || !base || !alignment) {
    return null;
  }

  const changed = alignment.changed;

  return (
    <>
      <span
        ref={pickerRef}
        className={clsx(
          'dropdown',
          styles.cmpDropdown,
          picking && 'dropdown--show',
        )}>
        <button
          type="button"
          className={clsx('badge', 'badge--secondary', styles.cmpTrigger)}
          aria-haspopup="true"
          aria-expanded={picking}
          onClick={() => setPicking((v) => !v)}>
          Compare with…
          <span className={styles.cmpCaret} aria-hidden="true" />
        </button>
        <ul className="dropdown__menu">
          {versions
            .filter((v) => v.name !== currentName)
            .map((v) => {
              const count = changeCounts[v.name];
              const countLabel =
                count === undefined
                  ? '…'
                  : `${count} change${count === 1 ? '' : 's'}`;
              return (
                <li key={v.name}>
                  <button
                    type="button"
                    className={clsx(
                      'dropdown__link',
                      styles.pick,
                      v.name === baseName && 'dropdown__link--active',
                    )}
                    onClick={() => {
                      setBaseName(v.name);
                      setHighlights(true);
                      setPicking(false);
                    }}>
                    {v.label}{' '}
                    <span className={styles.pickCount}>{countLabel}</span>
                  </button>
                </li>
              );
            })}
        </ul>
      </span>
      {highlights && (
        <button
          type="button"
          className={clsx(styles.highlightBtn, styles.highlightBtnOn)}
          onClick={() => setHighlights(false)}>
          Cancel
        </button>
      )}
    </>
  );
}

export default function VersionDiff() {
  const {metadata} = useDoc();
  const {version} = useDocsVersion();
  return (
    <BrowserOnly>
      {() => <VersionDiffBar docId={metadata.id} currentName={version} />}
    </BrowserOnly>
  );
}
