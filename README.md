# voting-api

## 🚀 How to Run the Project

### 1. Prerequisites

- Node.js (LTS version) 
- npm atau yarn
- I'm using Node.js version 22.17.1; please ensure you're using the same version or a higher one

### 2. Install Dependencies
```bash
npm install
```

or

```bash
yarn install
```

### 3. Environment Configuration
Create a .env file in the project root
```
PORT=8000
DATABASE_URL=mongodb://localhost:27017/mydb
JWT_SECRET=
SECRET_KEY=
```
please copy the variables and values from the .env file I attached in the assessment email

### 4. Running the Project
**Development Mode** (with nodemon):

```bash
npm run dev
```

**Production Mode**:

```bash
npm start
```

### 6. Accessing the Application
For the port, please adjust according to the configuration in the .env file.
```
http://localhost:8000
```


---

## 🧪 Running Unit Tests
Run the following command:

```bash
npm test
```

---
