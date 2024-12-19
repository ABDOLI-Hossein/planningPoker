
# Planning Poker Application

## Introduction

This project is a collaborative application designed to assist teams in estimating the complexity of tasks using the Planning Poker methodology. 
It enables real-time collaboration between multiple players and supports various game modes.

## Features

- Dynamic player addition and removal.
- Multiple game modes (strict, average, median, etc.).
- Task backlog management through JSON files.
- Automated revote in case of non-unanimous results.
- Real-time synchronization of votes and results.
- JSON file export of the finalized backlog after game completion.

## Usage Instructions

1. Install packaegs by the command: 
    npm install


2. Start the server using the command:
   node server.js
   

3. Open the application in multiple tabs or devices to simulate multiple players.

4. Enter player details, select a game mode, and load a backlog in the following JSON format:
   ```json
   [
       {
           "id": 1,
           "name": "Work 1",
           "estimatedDifficulty": null
       },
       {
           "id": 2,
           "name": "Work 2",
           "estimatedDifficulty": null
       },
       {
           "id": 3,
           "name": "Work 3",
           "estimatedDifficulty": null
       }
   ]
   ```

5. Players vote on each task. Results are calculated based on the selected game mode.

6. If all tasks are completed, the results are saved to a `backlog-result.json` file.

## Technical Details

- **Frontend**: HTML, CSS, JavaScript with Socket.IO for real-time communication.
- **Backend**: Node.js with Express and Socket.IO.
- **Data Persistence**: JSON files for storing results and backlog state.

## Additional Notes

- New players joining after the game has started will directly join the voting session without seeing the initial setup.
- If all players vote "café," the game's state will be saved for later resumption.

## File Structure

- `server.js`: Backend logic for managing the game and players.
- `public/`: Contains client-side files (`index.html`, `script.js`, `style.css`).
- `backlog.json`: Example backlog file for initial testing.

## Contact

For any issues or feedback, please contact the project maintainers.
