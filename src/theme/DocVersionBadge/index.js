import React, {useRef, useState, useEffect} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {
  useDocsVersion,
  useActiveDocContext,
  useVersions,
} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

// The docs plugin id. We only run a single (default) docs instance.
const PLUGIN_ID = 'default';

/**
 * The "Version: X.Y" badge, turned into a dropdown.
 *
 * The pill itself is the trigger: click it to switch this exact page to the
 * same page in another version. Only versions in which the current page exists
 * are listed (unlike the navbar version dropdown, which always lists every
 * version and falls back to a version's home page when the doc is missing).
 *
 * Falls back to the plain static badge when the page exists in a single
 * version, and renders nothing when the badge is disabled for this version.
 */
export default function DocVersionBadge({className}) {
  const versionMetadata = useDocsVersion();
  const {activeVersion, activeDoc, alternateDocVersions} =
    useActiveDocContext(PLUGIN_ID);
  const versions = useVersions(PLUGIN_ID);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Respect Docusaurus' own decision about whether to show a badge at all.
  if (!versionMetadata.badge) {
    return null;
  }

  const badgeClassName = clsx(
    className,
    ThemeClassNames.docs.docVersionBadge,
    'badge badge--secondary',
  );
  const label = `Version: ${versionMetadata.label}`;

  // Build the list of versions in which this exact page exists.
  // `alternateDocVersions` covers only the *other* versions; fold in the one
  // being viewed so it is listed (and marked active) too.
  const docVersions = activeVersion ? {...alternateDocVersions} : {};
  if (activeVersion && activeDoc) {
    docVersions[activeVersion.name] = activeDoc;
  }
  const available = versions.filter((version) => docVersions[version.name]);

  // Single version (or no doc context): plain static badge, no dropdown.
  if (available.length <= 1) {
    return <span className={badgeClassName}>{label}</span>;
  }

  return (
    <span
      ref={ref}
      className={clsx('dropdown', styles.dropdown, open && 'dropdown--show')}>
      <button
        type="button"
        className={clsx(badgeClassName, styles.trigger)}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}>
        {label}
        <span className={styles.caret} aria-hidden="true" />
      </button>
      <ul className="dropdown__menu">
        {available.map((version) => (
          <li key={version.name}>
            <Link
              className={clsx(
                'dropdown__link',
                version.name === activeVersion.name && 'dropdown__link--active',
              )}
              to={docVersions[version.name].path}
              onClick={() => setOpen(false)}>
              {version.label}
            </Link>
          </li>
        ))}
      </ul>
    </span>
  );
}
