export const questions = [
  {
    id: 1,
    question: 'You are designing a globally distributed URL shortening service with 100M writes/day and 5B reads/day. Network partitions and regional outages will occur. How do you generate unique IDs without global coordination, how do deletes work under GDPR, and what consistency guarantees do you relax first?',
    correct: 'Candidate explains decentralized ID generation, partition tolerance, delete semantics with tombstones or versioning, and explicitly discusses CAP trade-offs and failure modes.',
    skill: 'System Design'
  },
  {
    id: 2,
    question: 'Your distributed database shows uneven shard load despite even traffic. What metrics confirm a write hotspot, why can random IDs still hotspot, and how do you rebalance traffic without downtime?',
    correct: 'Candidate identifies shard-level metrics, explains secondary index or access-pattern hotspots, and proposes live re-sharding or traffic shaping strategies.',
    skill: 'Database Design'
  },
  {
    id: 3,
    question: 'During a network partition, users report both stale reads and failed writes. What consistency or availability choices are currently being made, and how would your decision change for payments versus a social feed?',
    correct: 'Candidate correctly reasons about CAP trade-offs in context and adapts guarantees based on business domain.',
    skill: 'Distributed Systems'
  },
  {
    id: 4,
    question: 'Design an API rate limiter that works across 10 regions, supports burst traffic, and tolerates Redis or coordination failures. Where does the source of truth live and do you fail open or closed?',
    correct: 'Candidate discusses distributed coordination, failure behavior, regional isolation, and safety vs availability trade-offs.',
    skill: 'System Design'
  },
  {
    id: 5,
    question: 'You must rename a database column used by old mobile clients, background workers, and lagging replicas. Describe the exact rollout steps, deployment order, and rollback strategy with zero downtime.',
    correct: 'Candidate provides a phased, backward-compatible migration plan including rollback and replication lag considerations.',
    skill: 'Database Design'
  },
  {
    id: 6,
    question: 'A Kafka consumer crashes after calling an external payment API but before committing offsets. How do you ensure correctness, where does idempotency live, and what is the worst-case duplicate scenario?',
    correct: 'Candidate correctly defines exactly-once semantics, handles side effects, and explains idempotency boundaries.',
    skill: 'Messaging Systems'
  },
  {
    id: 7,
    question: 'A high-write system shows low CPU usage but increasing write latency. What components do you inspect first and how does coordination overhead manifest?',
    correct: 'Candidate identifies network, locks, replication, or consensus as bottlenecks rather than compute.',
    skill: 'Distributed Systems'
  },
  {
    id: 8,
    question: 'Traffic spikes 50× within two minutes. What fails first, what do you shed intentionally, and how do you protect core functionality?',
    correct: 'Candidate prioritizes graceful degradation, load shedding, and system survivability.',
    skill: 'System Design'
  },
  {
    id: 9,
    question: 'Two regions diverge for five minutes and both accept writes. How do you reconcile data afterward and who loses data?',
    correct: 'Candidate explains conflict resolution strategies and acknowledges unavoidable data loss or inconsistency.',
    skill: 'Distributed Systems'
  },
  {
    id: 10,
    question: 'You use JWTs for authentication and a signing key is compromised. Tokens cannot be revoked instantly worldwide. What damage occurs and how do you limit blast radius?',
    correct: 'Candidate understands stateless auth risks and proposes layered mitigations.',
    skill: 'Authentication'
  },
  {
    id: 11,
    question: 'Auth latency spikes from 50ms to 3s. Walk through how this cascades across services, which retry policies are dangerous, and how to stop the cascade.',
    correct: 'Candidate demonstrates real on-call experience with retries, timeouts, and circuit breakers.',
    skill: 'System Design'
  },
  {
    id: 12,
    question: 'Millions of users are connected via WebSockets. One region fails. What happens to active connections and what delivery guarantees do users experience?',
    correct: 'Candidate understands stateful connections, reconnection behavior, and message guarantees.',
    skill: 'Messaging Systems'
  },
  {
    id: 13,
    question: 'After enabling synchronous replication, write latency doubles. What consistency improved and what new failure modes were introduced?',
    correct: 'Candidate correctly explains replication trade-offs and latency vs safety.',
    skill: 'Database Design'
  },
  {
    id: 14,
    question: 'You chose NoSQL for flexibility. Six months later, complex joins are required. What went wrong in the original decision and how do you recover?',
    correct: 'Candidate shows schema foresight and realistic migration strategies.',
    skill: 'Database Design'
  },
  {
    id: 15,
    question: 'Two nodes believe they hold the same distributed lock. How did this happen and how do you detect and recover from it?',
    correct: 'Candidate explains split-brain scenarios and unsafe locking mechanisms.',
    skill: 'Distributed Systems'
  },
  {
    id: 16,
    question: 'Distributed transactions are too slow for your system. What guarantees do you give up and how do you explain this trade-off to product teams?',
    correct: 'Candidate balances technical correctness with business communication.',
    skill: 'Database Design'
  },
  {
    id: 17,
    question: 'A large data backfill fails halfway through. How do you resume safely and detect silent data corruption?',
    correct: 'Candidate explains idempotent backfills, checkpoints, and validation.',
    skill: 'Database Design'
  },
  {
    id: 18,
    question: 'Design a leaderboard for millions of users that updates in near real time but tolerates temporary inconsistency. What do users observe?',
    correct: 'Candidate balances UX expectations with system constraints.',
    skill: 'System Design'
  },
  {
    id: 19,
    question: 'A write succeeds but a subsequent read returns old data. How is this possible in quorum systems and is it acceptable?',
    correct: 'Candidate understands quorum math and consistency windows.',
    skill: 'Distributed Systems'
  },
  {
    id: 20,
    question: 'One dependency is slow but not down. How do you detect this gray failure and automate recovery?',
    correct: 'Candidate identifies latency-based failure detection and automation.',
    skill: 'System Design'
  },
  {
    id: 21,
    question: 'One tenant in a multi-tenant SaaS overloads shared resources. How do you isolate impact and enforce fair usage?',
    correct: 'Candidate explains isolation, quotas, and noisy-neighbor mitigation.',
    skill: 'System Design'
  },
  {
    id: 22,
    question: 'After doubling database shards, latency increases. Why can horizontal scaling make performance worse?',
    correct: 'Candidate explains cross-shard coordination and complexity costs.',
    skill: 'Database Design'
  },
  {
    id: 23,
    question: 'A production secret leaks into logs. What is the blast radius and what controls should have prevented this?',
    correct: 'Candidate demonstrates defense-in-depth and incident response thinking.',
    skill: 'Security'
  },
  {
    id: 24,
    question: 'A disk reports successful writes but data is lost after a crash. How is this possible and how do you guarantee durability?',
    correct: 'Candidate understands storage layers, fsync, and replication.',
    skill: 'Database Design'
  },
  {
    id: 25,
    question: 'Your cache hit rate is 99%, yet users see stale data. Why and what do you fix first?',
    correct: 'Candidate understands cache invalidation and correctness over metrics.',
    skill: 'Caching'
  },
  {
    id: 26,
    question: 'A search index rebuild takes hours. How do you serve queries during rebuild and what consistency do users see?',
    correct: 'Candidate explains dual indexing or versioned indexes.',
    skill: 'Search Systems'
  },
  {
    id: 27,
    question: 'Batching increases throughput but hurts latency-sensitive users. How do you decide the cutoff?',
    correct: 'Candidate balances system efficiency with user experience.',
    skill: 'Performance'
  },
  {
    id: 28,
    question: 'You remove an API field nobody should be using. Something breaks. How do you detect this early and prevent it?',
    correct: 'Candidate understands backward compatibility and observability.',
    skill: 'API Design'
  },
  {
    id: 29,
    question: 'An operation retries for hours. When does idempotency expire and what state must be stored?',
    correct: 'Candidate reasons about long-running operations and state management.',
    skill: 'Messaging Systems'
  },
  {
    id: 30,
    question: 'CPU is low, errors are low, but users complain. What signal is missing?',
    correct: 'Candidate identifies latency, saturation, or user-centric metrics.',
    skill: 'Monitoring'
  },
  {
    id: 31,
    question: 'A payment succeeds but the response times out. What does the user see and how do you reconcile later?',
    correct: 'Candidate understands financial correctness and reconciliation.',
    skill: 'Payments'
  },
  {
    id: 32,
    question: 'A cache invalidation race causes stale writes. How do you prove correctness?',
    correct: 'Candidate reasons about concurrency and ordering guarantees.',
    skill: 'Caching'
  },
  {
    id: 33,
    question: 'Your event deduplication store is down. What breaks and what do you prioritize restoring?',
    correct: 'Candidate understands failure hierarchy and correctness trade-offs.',
    skill: 'Messaging Systems'
  },
  {
    id: 34,
    question: 'Two leaders accept writes simultaneously. Which data is incorrect and how do you resolve it?',
    correct: 'Candidate understands consensus failure recovery.',
    skill: 'Distributed Systems'
  },
  {
    id: 35,
    question: 'Clock drift causes frequent leader changes. Why does this happen and how do you stabilize leadership?',
    correct: 'Candidate understands time, leases, and consensus systems.',
    skill: 'Distributed Systems'
  },
  {
    id: 36,
    question: 'User data exists in logs, caches, and backups. What must be deleted for GDPR compliance and what can legally remain?',
    correct: 'Candidate understands compliance nuances and data lineage.',
    skill: 'Compliance'
  },
  {
    id: 37,
    question: 'Multiple services share a database and one deploy breaks others. Why was this inevitable and how do you untangle safely?',
    correct: 'Candidate understands service boundaries and decoupling.',
    skill: 'Distributed Systems'
  },
  {
    id: 38,
    question: 'Uptime is 100% but SLOs are violated. Which matters more and why?',
    correct: 'Candidate understands SLO-driven reliability.',
    skill: 'Monitoring'
  },
  {
    id: 39,
    question: 'Assume one dependency fails every day. How do you design the system around this assumption?',
    correct: 'Candidate demonstrates resilience-first design.',
    skill: 'System Design'
  },
  {
    id: 40,
    question: 'A system works today but feels fragile. What concerns you most and what do you fix first?',
    correct: 'Candidate shows senior engineering judgment and prioritization.',
    skill: 'System Design'
  },
]
