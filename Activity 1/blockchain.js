// blockchain.js
// Mini blockchain with Proof-of-Work (difficulty >= 3), multi-transaction blocks,
// and validation + tamper demo.
// Run: node blockchain.js [difficulty]
// Example: node blockchain.js 4

'use strict';
const crypto = require('crypto');

// ---------------- helpers ----------------
/** Stable JSON stringify (sorts object keys for deterministic hashing) */
function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(k => JSON.stringify(k)+':'+stableStringify(value[k])).join(',')}}`;
}

/** SHA-256 hex */
function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// ---------------- core classes ----------------
class Block {
  /**
   * @param {number} index
   * @param {string} timestamp - ISO string (e.g., new Date().toISOString())
   * @param {Array<object>} transactions - array of { from, to, amount }
   * @param {string} previousHash
   */
  constructor(index, timestamp, transactions, previousHash = '') {
    // enforce array-of-transactions by design
    if (!Array.isArray(transactions)) {
      throw new Error('transactions must be an array of objects');
    }
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /** Compute SHA-256 over the block’s contents */
  calculateHash() {
    const payload =
      String(this.index) +
      this.timestamp +
      stableStringify(this.transactions) +
      this.previousHash +
      String(this.nonce);
    return sha256(payload);
  }

  /** Proof-of-Work: find a hash starting with N leading zeros */
  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    const start = Date.now();
    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    const ms = Date.now() - start;
    console.log(
      `✅ Block mined (idx=${this.index})` +
      ` | difficulty=${difficulty}` +
      ` | attempts=${this.nonce}` +
      ` | time=${ms}ms` +
      ` | hash=${this.hash}`
    );
  }
}

class Blockchain {
  constructor(difficulty = 3) {
    this.difficulty = Math.max(3, Number(difficulty) || 3); // enforce ≥ 3
    if (Number(difficulty) && Number(difficulty) < 3) {
      console.log(`⚠️  Requested difficulty=${difficulty} < 3. Using 3 per assignment spec.`);
    }
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), [{ note: 'Genesis Block' }], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /** Add a new block composed of one or more transactions */
  addBlock(transactionsArray) {
    const idx = this.chain.length;
    const block = new Block(
      idx,
      new Date().toISOString(),
      transactionsArray,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);
    this.chain.push(block);
  }

  /** Verify integrity: hash consistency + correct previousHash links */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // recompute from current contents
      if (current.hash !== current.calculateHash()) return false;

      // ensure the link matches the actual previous hash
      if (current.previousHash !== previous.hash) return false;

      // ensure PoW is still satisfied (hash starts with required zeros)
      if (!current.hash.startsWith('0'.repeat(this.difficulty))) return false;
    }
    return true;
  }
}

// ---------------- demo / walkthrough ----------------
function main() {
  const cliDiff = Number(process.argv[2]);
  const difficulty = Number.isFinite(cliDiff) ? cliDiff : 3;

  console.log(`\n🚀 Starting mini blockchain (difficulty>=3, using ${Math.max(difficulty,3)})\n`);
  const demoChain = new Blockchain(difficulty);

  console.log('⛏️  Mining block #1 ...');
  demoChain.addBlock([
    { from: 'Alice', to: 'Bob', amount: 50 }  // 1
  ]);

  console.log('⛏️  Mining block #2 ...');
  demoChain.addBlock([
    { from: 'Charlie', to: 'Dana', amount: 75 }, // 2
    { from: 'Ivy', to: 'Jake', amount: 15 }      // 3
  ]);

  console.log('⛏️  Mining block #3 ...');
  demoChain.addBlock([
    { from: 'Eve', to: 'Frank', amount: 20 },    // 4
    { from: 'Gina', to: 'Hank', amount: 10 }     // 5  (≥5 total across the chain)
  ]);

  // Show the chain (optional – can be large)
  console.log('\n📜 Full chain:');
  console.log(JSON.stringify(demoChain, null, 2));

  // Validate (should be true)
  const validBefore = demoChain.isChainValid();
  console.log('\n🔎 Is chain valid?', validBefore);

  // Tamper test: modify a transaction in Block #1 (index=1)
  console.log('\n⚠️  Tampering with block #1 data ...');
  // Because block #1 stores an ARRAY of transactions, change the first tx’s amount:
  demoChain.chain[1].transactions[0].amount = 9999;

  // Validate again (should be false)
  const validAfter = demoChain.isChainValid();
  console.log('🔒 Is chain valid after tamper?', validAfter);

  // Visual assurance that mined hashes start with 000 at difficulty >= 3:
  console.log(`\n🧪 Hash prefixes (should start with at least "${'0'.repeat(demoChain.difficulty)}"):`);
  for (let i = 1; i < demoChain.chain.length; i++) {
    console.log(`Block #${i}: ${demoChain.chain[i].hash.slice(0, 10)}...`);
  }
}

main();
