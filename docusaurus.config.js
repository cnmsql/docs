// @ts-check

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CNMSQL - CloudNative for MySQL',
  tagline: 'A Kubernetes operator for Percona Server for MySQL',
  favicon: 'img/cnmsql.png',
  url: 'https://cnmsql.co',
  baseUrl: '/',
  organizationName: 'cnmsql',
  projectName: 'docs',
  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
    mermaid: true,
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // Authored content is pulled from cnmsql/cnmsql (docs/src) into ./current.
          // Released versions live under ./versioned_docs (cut on operator release).
          path: 'current',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Show every released version plus the unreleased "next" docs.
          includeCurrentVersion: true,
          versions: {
            current: {
              label: 'next 🚧',
              path: 'next',
            },
          },
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themes: ['@docusaurus/theme-mermaid', '@docsearch/docusaurus-adapter'],

  // Emits static/versiondiff/<docId>.json for the in-page version diff panel.
  plugins: [require.resolve('./plugins/version-diff')],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.svg',
      // Algolia DocSearch via @docsearch/docusaurus-adapter (Algolia-maintained).
      // The appId and (search-only) apiKey are public and safe to commit.
      // contextualSearch scopes results to the version the reader is viewing;
      // the adapter skips its facetFilters injection when askAi.agentStudio is
      // true, so Ask AI (Agent Studio backend) receives a valid request.
      // Uses the `docsearch` key (not `algolia`) so preset-classic's built-in
      // theme-search-algolia stays disabled and only the adapter handles search.
      docsearch: {
        appId: '80Y8ZEWQBI',
        apiKey: '88e1e9768914cb753242ecd420c9fd49',
        indexName: 'CNMSQL - Docs',
        contextualSearch: true,
        askAi: {
          assistantId: "0e916aac-64c5-4aeb-a556-98d814928e2b",
          agentStudio: true,
        },
      },
      navbar: {
        title: 'CNMSQL - CloudNative for MySQL',
        logo: {
          alt: 'CNMSQL - CloudNative for MySQL',
          src: 'img/cnmsql.png',
          srcDark: 'img/cnmsql.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/api-reference',
            label: 'API',
            position: 'left',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/cnmsql/cnmsql',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Overview',
                to: '/',
              },
              {
                label: 'Quickstart',
                to: '/quickstart',
              },
              {
                label: 'API Reference',
                to: '/api-reference',
              },
            ],
          },
          {
            title: 'Guides',
            items: [
              {
                label: 'Replication & Failover',
                to: '/replication-failover',
              },
              {
                label: 'Backup & Recovery',
                to: '/backup-recovery',
              },
              {
                label: 'Troubleshooting',
                to: '/troubleshooting',
              },
            ],
          },
          {
            title: 'Project',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/cnmsql/cnmsql',
              },
              {
                label: 'Percona Server',
                href: 'https://www.percona.com/software/mysql-database/percona-server',
              },
            ],
          },
        ],
        copyright: `Copyright &copy; ${new Date().getFullYear()} The CNMSQL - CloudNative for MySQL Authors. Documentation licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>. Built with <a href="https://docusaurus.io/" target="_blank">Docusaurus</a>.<br/><small>CNMSQL - CloudNative for MySQL is an independent project, not affiliated with Oracle, MySQL, the CNCF, or CloudNativePG.</small>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['go', 'yaml', 'bash'],
      },
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
      },
    }),
};

module.exports = config;
