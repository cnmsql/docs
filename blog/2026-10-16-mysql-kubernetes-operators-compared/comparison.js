// Data for the feature matrix in index.mdx. Checked on 2026-10-16; the
// Sources section of the post lists where each fact comes from.

export const projects = [
  {key: 'cnmsql', name: 'CNMSQL', href: 'https://github.com/cnmsql/cnmsql'},
  {
    key: 'pxc',
    name: 'Percona XtraDB Cluster operator',
    href: 'https://docs.percona.com/percona-operator-for-mysql/pxc/latest/index.html',
  },
  {
    key: 'ps',
    name: 'Percona Server operator',
    href: 'https://docs.percona.com/percona-operator-for-mysql/ps/latest/index.html',
  },
  {
    key: 'oracle',
    name: 'Oracle MySQL Operator',
    href: 'https://dev.mysql.com/doc/mysql-operator/en/',
  },
  {key: 'moco', name: 'MOCO', href: 'https://github.com/cybozu-go/moco'},
  {
    key: 'vitess',
    name: 'Vitess Operator',
    href: 'https://github.com/planetscale/vitess-operator',
  },
  {
    key: 'mariadb',
    name: 'mariadb-operator',
    href: 'https://github.com/mariadb-operator/mariadb-operator',
  },
  {key: 'kubedb', name: 'KubeDB', href: 'https://kubedb.com/'},
  {
    key: 'kubeblocks',
    name: 'KubeBlocks',
    href: 'https://github.com/apecloud/kubeblocks',
  },
];

export const sections = [
  {
    title: 'Project',
    rows: [
      {
        label: 'License',
        cells: {
          cnmsql: {text: 'Apache-2.0'},
          pxc: {text: 'Apache-2.0'},
          ps: {text: 'Apache-2.0'},
          oracle: {text: 'UPL 1.0'},
          moco: {text: 'Apache-2.0'},
          vitess: {text: 'Apache-2.0'},
          mariadb: {text: 'MIT'},
          kubedb: {text: 'Commercial', notes: ['kubedb-license']},
          kubeblocks: {text: 'AGPL-3.0'},
        },
      },
      {
        label: 'Latest release',
        cells: {
          cnmsql: {text: '0.8.0 (Sep 2026)', notes: ['cnmsql-age']},
          pxc: {text: '1.20.0 (Jun 2026)'},
          ps: {text: '1.2.0 (Jul 2026)'},
          oracle: {text: '26.7.0-2.3.0 (Jul 2026)'},
          moco: {text: '0.37.0 (Sep 2026)'},
          vitess: {text: '2.17.1 (Sep 2026)'},
          mariadb: {text: '26.10.1 (Sep 2026)'},
          kubedb: {text: 'v2026.10.12'},
          kubeblocks: {text: '1.0.2 (Feb 2026)'},
        },
      },
    ],
  },
  {
    title: 'Database engines',
    rows: [
      {
        label: 'MySQL',
        cells: {
          cnmsql: {status: 'yes', text: 'Percona Server 8.0, 8.4'},
          pxc: {status: 'yes', text: 'Percona XtraDB Cluster 5.7, 8.0, 8.4'},
          ps: {status: 'yes', text: 'Percona Server 8.0, 8.4'},
          oracle: {status: 'yes', text: 'MySQL 8.4, 9.7, 26.7'},
          moco: {status: 'yes', text: 'MySQL 8.0, 8.4'},
          vitess: {status: 'yes', text: 'MySQL, through Vitess 24'},
          mariadb: {status: 'no', text: 'MariaDB only'},
          kubedb: {status: 'yes'},
          kubeblocks: {status: 'yes', text: 'MySQL 5.7, 8.0, 8.4'},
        },
      },
      {
        label: 'MariaDB',
        cells: {
          cnmsql: {status: 'yes', text: '10.11, 11.4, 12.3'},
          pxc: {status: 'no'},
          ps: {status: 'no'},
          oracle: {status: 'no'},
          moco: {status: 'no'},
          vitess: {status: 'no'},
          mariadb: {status: 'yes', text: '10.6 and later'},
          kubedb: {status: 'yes', text: 'Separate resource'},
          kubeblocks: {status: 'yes', text: 'Separate addon'},
        },
      },
    ],
  },
  {
    title: 'High availability',
    rows: [
      {
        label: 'Async or semi-sync, with failover',
        cells: {
          cnmsql: {status: 'yes', text: 'Async or semi-sync'},
          pxc: {status: 'no', text: 'Galera instead'},
          ps: {status: 'partial', text: 'Async, tech preview', notes: ['ps-async']},
          oracle: {status: 'no', text: 'Group Replication only'},
          moco: {status: 'yes', text: 'Semi-sync, up to 5 instances'},
          vitess: {status: 'yes', text: 'Failover by VTOrc'},
          mariadb: {status: 'yes', text: 'Async'},
          kubedb: {status: 'yes', text: 'Semi-sync'},
          kubeblocks: {status: 'yes'},
        },
      },
      {
        label: 'Group Replication',
        cells: {
          cnmsql: {status: 'yes', text: 'Single-primary', notes: ['cnmsql-gr']},
          pxc: {status: 'no'},
          ps: {status: 'yes', text: 'GA'},
          oracle: {status: 'yes', text: 'InnoDB Cluster'},
          moco: {status: 'no'},
          vitess: {status: 'no'},
          mariadb: {status: 'no', text: 'Not in MariaDB'},
          kubedb: {status: 'yes', text: 'Also InnoDB Cluster'},
          kubeblocks: {status: 'yes'},
        },
      },
      {
        label: 'Galera',
        cells: {
          cnmsql: {status: 'no'},
          pxc: {status: 'yes', notes: ['galera']},
          ps: {status: 'no'},
          oracle: {status: 'no'},
          moco: {status: 'no'},
          vitess: {status: 'no'},
          mariadb: {status: 'yes'},
          kubedb: {status: 'yes', text: 'Separate resources'},
          kubeblocks: {status: 'unknown'},
        },
      },
      {
        label: 'Sharding',
        cells: {
          cnmsql: {status: 'no'},
          pxc: {status: 'no'},
          ps: {status: 'no'},
          oracle: {status: 'no'},
          moco: {status: 'no'},
          vitess: {status: 'yes'},
          mariadb: {status: 'no'},
          kubedb: {status: 'no'},
          kubeblocks: {status: 'no'},
        },
      },
      {
        label: 'Standby cluster in another region',
        cells: {
          cnmsql: {status: 'no', text: 'Planned', notes: ['cnmsql-replica']},
          pxc: {status: 'yes', text: 'Multi-site replication'},
          ps: {status: 'yes', text: 'Group Replication only (1.2.0)'},
          oracle: {status: 'unknown'},
          moco: {status: 'partial', text: 'Replicates from an external MySQL'},
          vitess: {status: 'partial', text: 'Zones in one Kubernetes cluster', notes: ['vitess-cells']},
          mariadb: {status: 'yes', text: 'Multi-cluster replication'},
          kubedb: {status: 'yes', text: 'Remote replica'},
          kubeblocks: {status: 'unknown'},
        },
      },
    ],
  },
  {
    title: 'Client routing',
    rows: [
      {
        label: 'Native routing',
        cells: {
          cnmsql: {status: 'yes', text: 'Read-write, read-only and any-instance Services', notes: ['services']},
          pxc: {status: 'partial', text: 'Proxy by default', notes: ['pxc-direct']},
          ps: {status: 'unknown'},
          oracle: {status: 'no', text: 'Through MySQL Router'},
          moco: {status: 'yes', text: 'Primary and replica Services', notes: ['services']},
          vitess: {status: 'no', text: 'Through vtgate'},
          mariadb: {status: 'yes', text: 'Primary and secondary Services'},
          kubedb: {status: 'unknown'},
          kubeblocks: {status: 'unknown'},
        },
      },
      {
        label: 'Proxy',
        cells: {
          cnmsql: {status: 'no'},
          pxc: {status: 'yes', text: 'HAProxy or ProxySQL'},
          ps: {status: 'yes', text: 'HAProxy or MySQL Router'},
          oracle: {status: 'yes', text: 'MySQL Router'},
          moco: {status: 'no'},
          vitess: {status: 'yes', text: 'vtgate'},
          mariadb: {status: 'yes', text: 'MaxScale, optional'},
          kubedb: {status: 'unknown'},
          kubeblocks: {status: 'unknown'},
        },
      },
      {
        label: 'Connection pooling',
        cells: {
          cnmsql: {status: 'no'},
          pxc: {status: 'partial', text: 'With ProxySQL'},
          ps: {status: 'unknown', notes: ['router-pooling']},
          oracle: {status: 'unknown', notes: ['router-pooling']},
          moco: {status: 'no'},
          vitess: {status: 'yes', text: 'vttablet pools'},
          mariadb: {status: 'unknown'},
          kubedb: {status: 'unknown'},
          kubeblocks: {status: 'unknown'},
        },
      },
    ],
  },
  {
    title: 'Backup and recovery',
    rows: [
      {
        label: 'Physical backups',
        cells: {
          cnmsql: {status: 'yes', text: 'XtraBackup or mariadb-backup'},
          pxc: {status: 'yes', text: 'XtraBackup'},
          ps: {status: 'yes', text: 'XtraBackup, incremental, encrypted'},
          oracle: {status: 'no', text: 'Logical dumps only'},
          moco: {status: 'no', text: 'Logical dumps only'},
          vitess: {status: 'yes', text: 'Builtin or XtraBackup engine'},
          mariadb: {status: 'yes', text: 'mariadb-backup, volume snapshots'},
          kubedb: {status: 'unknown'},
          kubeblocks: {status: 'yes', text: 'XtraBackup'},
        },
      },
      {
        label: 'Logical backups',
        cells: {
          cnmsql: {status: 'yes', text: 'mysqldump or mariadb-dump'},
          pxc: {status: 'no', text: 'XtraBackup only'},
          ps: {status: 'no', text: 'XtraBackup only'},
          oracle: {status: 'yes', text: 'MySQL Shell dump'},
          moco: {status: 'yes', text: 'MySQL Shell dump'},
          vitess: {status: 'partial', text: 'MySQL Shell engine, experimental'},
          mariadb: {status: 'yes', text: 'mariadb-dump'},
          kubedb: {status: 'yes', text: 'Through KubeStash'},
          kubeblocks: {status: 'yes', text: 'mydumper'},
        },
      },
      {
        label: 'Backup storage',
        cells: {
          cnmsql: {status: 'partial', text: 'S3-compatible only', notes: ['cnmsql-s3']},
          pxc: {status: 'yes', text: 'S3-compatible, Azure, volume'},
          ps: {status: 'yes', text: 'S3-compatible, GCS, Azure'},
          oracle: {status: 'yes', text: 'S3, Azure, OCI, volume'},
          moco: {status: 'yes', text: 'S3-compatible, GCS, Azure'},
          vitess: {status: 'yes', text: 'S3, GCS, Ceph, file'},
          mariadb: {status: 'yes', text: 'S3-compatible, Azure, volume'},
          kubedb: {status: 'yes', text: 'S3, GCS, Azure, volume'},
          kubeblocks: {status: 'yes', text: 'S3, GCS, Azure and others'},
        },
      },
      {
        label: 'Point-in-time recovery',
        cells: {
          cnmsql: {status: 'yes', text: 'To a time or a GTID', notes: ['cnmsql-pitr']},
          pxc: {status: 'yes', notes: ['pxc-pitr']},
          ps: {status: 'partial', text: 'Tech preview'},
          oracle: {status: 'unknown'},
          moco: {status: 'partial', text: 'Up to the last backup run', notes: ['moco-pitr']},
          vitess: {status: 'yes', text: 'To a time or a GTID'},
          mariadb: {status: 'yes', text: 'Since 26.3.0'},
          kubedb: {status: 'yes', text: 'Continuous archiving'},
          kubeblocks: {status: 'unknown'},
        },
      },
    ],
  },
  {
    title: 'Day-2 operations',
    rows: [
      {
        label: 'Declarative users and databases',
        cells: {
          cnmsql: {status: 'yes', text: 'Database and DatabaseUser resources'},
          pxc: {status: 'partial', text: 'Users in the cluster resource (1.16+)', notes: ['pxc-users']},
          ps: {status: 'no', text: 'System users only'},
          oracle: {status: 'unknown'},
          moco: {status: 'no', text: 'Operator accounts only'},
          vitess: {status: 'partial', text: 'Keyspaces and vtgate users'},
          mariadb: {status: 'yes', text: 'User, Grant and Database resources'},
          kubedb: {status: 'unknown'},
          kubeblocks: {status: 'unknown'},
        },
      },
      {
        label: 'In-place major version upgrade',
        cells: {
          cnmsql: {status: 'yes', text: '8.0 to 8.4', notes: ['cnmsql-upgrade']},
          pxc: {status: 'unknown', text: 'Only minor upgrades documented'},
          ps: {status: 'unknown', text: 'Only minor upgrades documented'},
          oracle: {status: 'unknown'},
          moco: {status: 'yes', text: 'Rolling, one instance at a time'},
          vitess: {status: 'unknown'},
          mariadb: {status: 'unknown'},
          kubedb: {status: 'yes', text: 'UpdateVersion request'},
          kubeblocks: {status: 'unknown'},
        },
      },
    ],
  },
];

export const notes = {
  'kubedb-license':
    'Free only for databases created and destroyed within 30 days, such as dev or CI clusters. Production use needs a paid license.',
  'cnmsql-age':
    'First release (0.1.0) on 18 June 2026. The API is still v1alpha1, and the repository lists three contributors.',
  'ps-async':
    'Percona labels asynchronous replication a tech preview and does not recommend it for production.',
  'cnmsql-gr':
    'MySQL 8.0.22 and later. Multi-primary mode is rejected, and a running cluster cannot switch between async replication and Group Replication.',
  galera:
    'Galera needs primary keys and InnoDB tables, and large or conflicting transactions can fail certification. Commits wait for the cluster.',
  'cnmsql-replica':
    'The spec.replica field exists in the API, but the operator rejects it today. Cross-region recovery means restoring from the object store.',
  'vitess-cells':
    'The operator documentation describes replicating across availability zones within one Kubernetes cluster.',
  services:
    'Clients connect straight to the database Pod, with no extra hop. The application picks the read-write or read-only Service itself and reconnects after a failover.',
  'pxc-direct':
    'HAProxy is the default. The operator can also expose the XtraDB Cluster Pods directly.',
  'router-pooling':
    'MySQL Router 8.4 can share and reuse server connections. We did not find an operator setting that turns it on.',
  'cnmsql-pitr':
    'Binary logs are archived continuously to S3-compatible storage. Recovery cannot bring back transactions that were never archived and are missing from the new primary.',
  'pxc-pitr':
    'A dedicated Pod uploads binary logs to S3-compatible or Azure storage at a configurable interval.',
  'cnmsql-s3':
    'Any S3-compatible store, including AWS S3, MinIO, Ceph RGW, Cloudflare R2 and Backblaze B2. GCS works through its S3 interoperability API with HMAC keys. Azure Blob Storage and volumes are not supported.',
  'pxc-users':
    'Users and grants are declared in the users section of the cluster resource. Removing a user from the resource does not drop it from the database.',
  'cnmsql-upgrade':
    'One series at a time, with a rolling restart and a switchover. MariaDB follows 10.11, 11.4, 12.3. Downgrades are not supported.',
  'moco-pitr':
    'Binary logs are collected at each backup run, not streamed. If the whole cluster is lost, up to one backup interval of writes can be lost.',
};
