export const questions = [
  {
    id: 1,
    question: 'How would you design a globally distributed URL shortening service?',
    answer: 'Use consistent hashing, globally unique IDs, multi-region replication, and eventual consistency',
  },
  {
    id: 2,
    question: 'How do you prevent write hotspots in a distributed database?',
    answer: 'Use sharding with well-distributed keys and avoid sequential IDs',
  },
  {
    id: 3,
    question: 'What trade-offs exist between strong consistency and availability?',
    answer: 'Strong consistency reduces availability during network partitions',
  },
  {
    id: 4,
    question: 'How would you design an API rate limiter for millions of users?',
    answer: 'Use a distributed token bucket or leaky bucket with Redis',
  },
  {
    id: 5,
    question: 'How would you handle schema changes without downtime?',
    answer: 'Use backward-compatible changes, feature flags, and phased deployments',
  },
  {
    id: 6,
    question: 'How do you ensure exactly-once message processing?',
    answer: 'Use idempotent consumers and transactional outbox patterns',
  },
  {
    id: 7,
    question: 'What is the main bottleneck in a high-write distributed system?',
    answer: 'Network latency and coordination overhead',
  },
  {
    id: 8,
    question: 'How would you design a system to handle flash traffic spikes?',
    answer: 'Auto-scaling, load balancing, caching, and graceful degradation',
  },
  {
    id: 9,
    question: 'What is the impact of network partitions on distributed systems?',
    answer: 'They force a trade-off between consistency and availability',
  },
  {
    id: 10,
    question: 'How do you design a highly available authentication system?',
    answer: 'Stateless tokens, replicated user stores, and multi-region failover',
  },
  {
    id: 11,
    question: 'What causes cascading failures and how do you prevent them?',
    answer: 'Tight coupling and retries without limits; prevent with circuit breakers and timeouts',
  },
  {
    id: 12,
    question: 'How would you design a real-time notification system?',
    answer: 'Use message queues, WebSockets, and horizontal scaling',
  },
  {
    id: 13,
    question: 'What is the difference between synchronous replication and asynchronous replication?',
    answer: 'Synchronous waits for replicas to confirm, asynchronous does not',
  },
  {
    id: 14,
    question: 'How do you decide between SQL and NoSQL for a new system?',
    answer: 'Based on consistency needs, data relationships, and access patterns',
  },
  {
    id: 15,
    question: 'How would you design a distributed locking mechanism?',
    answer: 'Use Redis with expiration or consensus-based systems like etcd',
  },
  {
    id: 16,
    question: 'What are the risks of distributed transactions?',
    answer: 'High latency, partial failures, and complexity',
  },
  {
    id: 17,
    question: 'How do you handle data migrations at scale?',
    answer: 'Use backfills, dual writes, and background migration jobs',
  },
  {
    id: 18,
    question: 'How would you design a leaderboard system with millions of users?',
    answer: 'Use sorted sets, caching, and periodic batch updates',
  },
  {
    id: 19,
    question: 'What is the purpose of quorum reads and writes?',
    answer: 'To balance consistency and availability in distributed systems',
  },
  {
    id: 20,
    question: 'How do you detect and recover from partial system failures?',
    answer: 'Health checks, retries with backoff, and automated failover',
  },
  {
    id: 21,
    question: 'How would you design a multi-tenant SaaS backend?',
    answer: 'Tenant isolation, scoped access control, and resource quotas',
  },
  {
    id: 22,
    question: 'What is the biggest challenge in horizontal scaling databases?',
    answer: 'Maintaining data consistency across shards',
  },
  {
    id: 23,
    question: 'How do you manage secrets in production systems?',
    answer: 'Use secure secret managers and rotate credentials regularly',
  },
  {
    id: 24,
    question: 'How would you design a system to guarantee data durability?',
    answer: 'Write-ahead logging, replication, and backups',
  },
  {
    id: 25,
    question: 'What are the dangers of over-caching?',
    answer: 'Stale data, cache invalidation complexity, and memory pressure',
  },
  {
    id: 26,
    question: 'How would you design a search system at scale?',
    answer: 'Use inverted indexes, sharding, and distributed search engines',
  },
  {
    id: 27,
    question: 'What is the trade-off between latency and throughput?',
    answer: 'Optimizing for one often degrades the other',
  },
  {
    id: 28,
    question: 'How do you design APIs for backward compatibility?',
    answer: 'Versioning, optional fields, and additive changes',
  },
  {
    id: 29,
    question: 'What is eventual idempotency?',
    answer: 'Ensuring repeated operations eventually converge to the same result',
  },
  {
    id: 30,
    question: 'How do you ensure observability in large systems?',
    answer: 'Logging, metrics, tracing, and alerting',
  },
  {
    id: 31,
    question: 'How would you design a payments processing system?',
    answer: 'Idempotency keys, strong consistency, and audit logs',
  },
  {
    id: 32,
    question: 'What is the hardest problem in distributed caching?',
    answer: 'Cache invalidation',
  },
  {
    id: 33,
    question: 'How do you handle duplicate events in event-driven systems?',
    answer: 'Use idempotent handlers and deduplication keys',
  },
  {
    id: 34,
    question: 'What is a split-brain scenario?',
    answer: 'When multiple nodes think they are the primary leader',
  },
  {
    id: 35,
    question: 'How do you avoid split-brain?',
    answer: 'Leader election using quorum-based consensus',
  },
  {
    id: 36,
    question: 'How would you design a system for GDPR data deletion?',
    answer: 'Data lineage tracking and cascading deletion workflows',
  },
  {
    id: 37,
    question: 'What are the risks of shared databases across microservices?',
    answer: 'Tight coupling and limited independent scalability',
  },
  {
    id: 38,
    question: 'How do you measure system reliability?',
    answer: 'Using SLIs, SLOs, and error budgets',
  },
  {
    id: 39,
    question: 'How do you design systems for failure instead of success?',
    answer: 'Assume failures will happen and build redundancy',
  },
  {
    id: 40,
    question: 'What distinguishes a senior backend engineer from a junior?',
    answer: 'Ability to reason about trade-offs, scalability, and failure modes',
  },
]
