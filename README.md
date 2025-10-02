_Documentations are places in the Github Wiki page_

# Introduction
In modern university environments, students and staff require seamless communication platforms to collaborate, socialize, and share information efficiently. Existing solutions often lack integration, are not tailored for the KU community, or do not provide privacy and role-based access control suitable for academic settings.
KUSA aims to provide a KU social media and chat platform, allowing users to interact in servers, chat rooms, and private messaging spaces with a focus on usability, privacy, and multimedia support. Additionally, it will integrate academic data such as class schedules and student codes to enhance connectivity and community engagement within Kasetsart University.

# Setup Guide
To get started with the project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/taamtera/KUSA.git
   cd ISPProject1
   ```

2. **Setup MongoDB**:
   Make sure you have Docker installed and running. Then, run the following command to start a MongoDB container:
   ```bash
   docker run --name mongo -d -p 27017:27017 -v ./mongo-data:/data/db mongo
   ```

3. **Setup Backend**:
   Install dependencies and start the backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Setup Frontend**:
   Open a new terminal, install dependencies and start the frontend development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**:
   Open your web browser and go to `http://localhost:3000` to see the frontend in action.

# CI/CD
###

# Members
- Taam Paramee
- Oak Soe Htet
- Chaiyapat Kumtho
- Amornrit Sirikham
- Pasin Tongtip
