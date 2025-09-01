# Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/taamtera/ISPProject1.git
   cd ISPProject1
   ```

2. **Install dependencies**:
   For the frontend:
   ```bash
   cd frontend
   npm install
   ```

   For the backend:
   ```bash
   cd backend
   npm install
   ```
   
3. **Run Mongo Db Container in Docker**:
   Make sure you have Docker installed and running. Then, run the following command to start a MongoDB container:
   ```bash
   cd mongod-data
   docker run --name mongo -d -p 27017:27017 -v .:/data/db mongo
   ```

4. **Run the application**:
   Start the backend server:
   ```bash
   cd backend
   npm start
   ```

   Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**:
   Open your web browser and go to `http://localhost:3000` to see the frontend in action.


# Members -
- Taam Paramee
- Oak Soe Htet
- Chaiyapat Kumtho
- Amornrit Sirikham
- Pasin Tongtip