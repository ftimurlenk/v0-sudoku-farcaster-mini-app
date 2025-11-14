// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SudokuScore {
    struct ScoreEntry {
        address player;
        uint256 score;
        uint8 difficulty; // 0: easy, 1: medium, 2: hard
        uint256 timestamp;
    }

    mapping(address => uint256) public playerBestScores;
    mapping(address => ScoreEntry[]) public playerScores;
    ScoreEntry[] public leaderboard;

    event ScoreSaved(address indexed player, uint256 score, uint8 difficulty, uint256 timeInSeconds);

    function saveScore(uint8 difficulty, uint256 timeInSeconds, uint256 score) external {
        require(difficulty <= 2, "Invalid difficulty");
        require(score > 0, "Invalid score");

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
        
        // Sort leaderboard (top 10)
        for (uint i = leaderboard.length - 1; i > 0 && i < 10; i--) {
            if (leaderboard[i].score > leaderboard[i - 1].score) {
                ScoreEntry memory temp = leaderboard[i];
                leaderboard[i] = leaderboard[i - 1];
                leaderboard[i - 1] = temp;
            }
        }

        // Keep only top 10
        if (leaderboard.length > 10) {
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
