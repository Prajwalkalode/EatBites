const app  = require('./app');
const connectDB = require('./database/dbConnection');
const port = process.env.PORT;

async function startServer() {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`homepage-store-list running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
		process.exit(1);
    }
};

startServer();