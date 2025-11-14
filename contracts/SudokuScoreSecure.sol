// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract SudokuScoreSecure is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct ScoreEntry {
        address player;
        uint256 score;
        uint8 difficulty;
        uint256 timestamp;
    }

    mapping(address => uint256) public playerBestScores;
    mapping(address => ScoreEntry[]) public playerScores;
    mapping(bytes32 => bool) public usedSignatures;
    ScoreEntry[] public leaderboard;

    address public validator;

    event ScoreSaved(address indexed player, uint256 score, uint8 difficulty, uint256 timeInSeconds);
    event ValidatorUpdated(address indexed newValidator);

    constructor() Ownable(msg.sender) {
        validator = msg.sender;
    }

    function setValidator(address _validator) external onlyOwner {
        require(_validator != address(0), "Invalid validator address");
        validator = _validator;
        emit ValidatorUpdated(_validator);
    }

    function saveScore(
        uint8 difficulty,
        uint256 timeInSeconds,
        uint256 score,
        bytes32 gameId,
        bytes memory signature
    ) external {
        require(difficulty <= 2, "Invalid difficulty");
        require(score > 0, "Invalid score");
        require(!usedSignatures[gameId], "Game already submitted");

        // Verify signature from validator
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, difficulty, timeInSeconds, score, gameId)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        
        require(recoveredSigner == validator, "Invalid signature");

        // Mark signature as used to prevent replay attacks
        usedSignatures[gameId] = true;

        ScoreEntry memory newEntry = ScoreEntry({
            player: msg.sender,
            score: score,
            difficulty: difficulty,
            timestamp: block.timestamp
        });

        playerScores[msg.sender].push(newEntry);

        if (score > playerBestScores[msg.sender]) {
            playerBestScores[msg.sender] = score;
            updateLeaderboard(newEntry);
        }

        emit ScoreSaved(msg.sender, score, difficulty, timeInSeconds);
    }

    function updateLeaderboard(ScoreEntry memory entry) private {
        leaderboard.push(entry);
        
        // Sort leaderboard (top 100 for better competition)
        for (uint i = leaderboard.length - 1; i > 0 && i < 100; i--) {
            if (leaderboard[i].score > leaderboard[i - 1].score) {
                ScoreEntry memory temp = leaderboard[i];
                leaderboard[i] = leaderboard[i - 1];
                leaderboard[i - 1] = temp;
            }
        }

        // Keep only top 100
        if (leaderboard.length > 100) {
            leaderboard.pop();
        }
    }

    function getPlayerBestScore(address player) external view returns (uint256) {
        return playerBestScores[player];
    }

    function getLeaderboard() external view returns (ScoreEntry[] memory) {
        return leaderboard;
    }

    function getPlayerScores(address player) external view returns (ScoreEntry[] memory) {
        return playerScores[player];
    }
}
