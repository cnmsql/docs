import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// Status levels. Every dot is paired with a text label so the meaning never
// relies on color alone.
const STATUS = {
  yes: {className: styles.yes, label: 'Yes', legend: 'Supported'},
  partial: {
    className: styles.partial,
    label: 'Partial',
    legend: 'Partial, with caveats, or tech preview',
  },
  no: {className: styles.no, label: 'No', legend: 'Not supported'},
  unknown: {
    className: styles.unknown,
    label: 'Not documented',
    legend: 'Not found in the docs we checked',
  },
};

/**
 * A wide feature matrix: one column per project, one row per feature, grouped
 * in sections. The first column stays pinned while the table scrolls
 * sideways.
 *
 * Props:
 * - projects: [{key, name, href}]
 * - sections: [{title, rows: [{label, cells: {[projectKey]: cell}}]}]
 *   where cell is {status?, text?, notes?: [noteId]}. A cell without a status
 *   renders as plain text (used for facts like licenses and versions).
 * - notes: {[noteId]: string}. Notes are numbered in order of first use.
 * - idPrefix: prefix for note anchors, unique per page.
 */
export default function ComparisonMatrix({
  projects,
  sections,
  notes = {},
  idPrefix = 'cmp',
  caption,
}) {
  // Number the notes in reading order: row by row, left to right.
  const numbers = new Map();
  for (const section of sections) {
    for (const row of section.rows) {
      for (const project of projects) {
        for (const id of row.cells[project.key]?.notes ?? []) {
          if (!(id in notes)) {
            throw new Error(`ComparisonMatrix: unknown note "${id}"`);
          }
          if (!numbers.has(id)) {
            numbers.set(id, numbers.size + 1);
          }
        }
      }
    }
  }
  const noteAnchor = (id) => `${idPrefix}-note-${id}`;

  return (
    <div className={styles.matrix}>
      <ul className={styles.legend} aria-label="Legend">
        {Object.entries(STATUS).map(([key, s]) => (
          <li key={key}>
            <span className={clsx(styles.dot, s.className)} aria-hidden />
            {s.legend}
          </li>
        ))}
      </ul>
      <p className={styles.hint}>Scroll sideways to see every project.</p>
      <div
        className={styles.scroller}
        role="region"
        aria-label={caption ?? 'Feature comparison'}
        tabIndex={0}>
        <table className={styles.table}>
          {caption && <caption className={styles.srOnly}>{caption}</caption>}
          <thead>
            <tr>
              <th scope="col" className={styles.feature}>
                Feature
              </th>
              {projects.map((p) => (
                <th scope="col" key={p.key} className={styles.project}>
                  {p.href ? <Link to={p.href}>{p.name}</Link> : p.name}
                </th>
              ))}
            </tr>
          </thead>
          {sections.map((section) => (
            <tbody key={section.title}>
              <tr className={styles.section}>
                <th scope="colgroup" colSpan={projects.length + 1}>
                  <span>{section.title}</span>
                </th>
              </tr>
              {section.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className={styles.feature}>
                    {row.label}
                  </th>
                  {projects.map((p) => {
                    const cell = row.cells[p.key] ?? {status: 'unknown'};
                    const status = cell.status && STATUS[cell.status];
                    if (cell.status && !status) {
                      throw new Error(
                        `ComparisonMatrix: unknown status "${cell.status}"`,
                      );
                    }
                    return (
                      <td key={p.key}>
                        <span className={styles.cell}>
                          {status && (
                            <span
                              className={clsx(styles.dot, status.className)}
                              aria-hidden
                            />
                          )}
                          <span>
                            {cell.text ?? status?.label}
                            {(cell.notes ?? []).map((id) => (
                              <sup key={id} className={styles.ref}>
                                <a
                                  href={`#${noteAnchor(id)}`}
                                  aria-label={`Note ${numbers.get(id)}`}>
                                  {numbers.get(id)}
                                </a>
                              </sup>
                            ))}
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      {numbers.size > 0 && (
        <ol className={styles.notes}>
          {/* Array.from, not spread: the client build compiles spread in loose
              mode, which only handles arrays, not Map iterators. */}
          {Array.from(numbers.keys()).map((id) => (
            <li key={id} id={noteAnchor(id)}>
              {notes[id]}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
