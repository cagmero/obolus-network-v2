// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ShieldedVault
 * @notice Privacy-preserving vault for tokenized equities on BNB Chain.
 *
 * Key difference from the old RWAVault:
 * - Deposits go to a POOL WALLET, not tracked per-user on-chain
 * - No public `positions[user][token]` mapping
 * - Only the pool wallet (controlled by CRE) can move funds out
 * - On-chain observer sees: "someone deposited X tokens into the vault"
 *   but CANNOT see individual user positions
 *
 * Privacy model:
 * - User deposits tokens → vault holds them in pool
 * - Per-user positions tracked off-chain (ECIES-encrypted, blind storage)
 * - Only Chainlink CRE (TEE) can decrypt and settle positions
 * - Withdrawals: CRE signs a release, vault sends tokens back to user
 */
contract ShieldedVault is Ownable {
    using SafeERC20 for IERC20;

    // Pool wallet address — controlled by CRE via threshold signing
    address public poolWallet;

    // Oracle for NAV pricing
    address public oracle;

    // Accepted tokens
    mapping(address => bool) public acceptedTokens;
    address[] public tokenList;

    // Total shielded per token (aggregate only — no per-user breakdown)
    mapping(address => uint256) public totalShielded;

    // Nonce per user to prevent replay attacks
    mapping(address => uint256) public nonces;

    // Events — intentionally minimal to preserve privacy
    // Note: we emit token and amount for deposit (visible on-chain)
    // but do NOT emit per-user position data
    event Deposited(address indexed token, uint256 amount, bytes32 indexed depositId);
    event Withdrawn(address indexed token, uint256 amount, address indexed recipient);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event PoolWalletUpdated(address indexed oldPool, address indexed newPool);

    constructor(address _poolWallet, address _oracle) Ownable(msg.sender) {
        require(_poolWallet != address(0), "Invalid pool wallet");
        poolWallet = _poolWallet;
        oracle = _oracle;
    }

    // ── Deposit (anyone can deposit accepted tokens) ────────────

    /**
     * @notice Deposit tokens into the shielded vault.
     * Tokens are held by the vault contract. A depositId is emitted
     * for the server to correlate with the off-chain encrypted position.
     * The depositId is a hash of (sender, token, amount, nonce) — it does
     * NOT reveal the user's total position.
     */
    function deposit(address token, uint256 amount) external {
        require(acceptedTokens[token], "Token not accepted");
        require(amount > 0, "Amount must be > 0");

        uint256 nonce = nonces[msg.sender]++;
        bytes32 depositId = keccak256(abi.encodePacked(msg.sender, token, amount, nonce, block.timestamp));

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        totalShielded[token] += amount;

        emit Deposited(token, amount, depositId);
    }

    // ── Withdraw (only pool wallet can release funds) ───────────

    /**
     * @notice Release tokens from the vault to a recipient.
     * ONLY the pool wallet (CRE-controlled) can call this.
     * This is the key privacy mechanism: withdrawals are initiated
     * by the CRE after verifying the user's encrypted position,
     * not by the user directly.
     */
    function release(address token, uint256 amount, address recipient) external {
        require(msg.sender == poolWallet, "Only pool wallet");
        require(amount > 0, "Amount must be > 0");
        require(totalShielded[token] >= amount, "Insufficient shielded balance");

        totalShielded[token] -= amount;
        IERC20(token).safeTransfer(recipient, amount);

        emit Withdrawn(token, amount, recipient);
    }

    /**
     * @notice Batch release — CRE can process multiple withdrawals in one tx.
     */
    function batchRelease(
        address[] calldata tokens,
        uint256[] calldata amounts,
        address[] calldata recipients
    ) external {
        require(msg.sender == poolWallet, "Only pool wallet");
        require(tokens.length == amounts.length && amounts.length == recipients.length, "Length mismatch");

        for (uint256 i = 0; i < tokens.length; i++) {
            require(totalShielded[tokens[i]] >= amounts[i], "Insufficient shielded balance");
            totalShielded[tokens[i]] -= amounts[i];
            IERC20(tokens[i]).safeTransfer(recipients[i], amounts[i]);
            emit Withdrawn(tokens[i], amounts[i], recipients[i]);
        }
    }

    // ── Admin ───────────────────────────────────────────────────

    function addToken(address token) external onlyOwner {
        require(!acceptedTokens[token], "Already accepted");
        acceptedTokens[token] = true;
        tokenList.push(token);
        emit TokenAdded(token);
    }

    function removeToken(address token) external onlyOwner {
        acceptedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function updatePoolWallet(address newPool) external onlyOwner {
        require(newPool != address(0), "Invalid address");
        emit PoolWalletUpdated(poolWallet, newPool);
        poolWallet = newPool;
    }

    function updateOracle(address newOracle) external onlyOwner {
        oracle = newOracle;
    }

    // ── View ────────────────────────────────────────────────────

    function getTokenList() external view returns (address[] memory) {
        return tokenList;
    }

    function getTotalShielded(address token) external view returns (uint256) {
        return totalShielded[token];
    }
}
