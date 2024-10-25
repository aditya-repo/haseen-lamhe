const mongoose = require("mongoose")

const database = async (URL) => {
    const startTime = new Date()
    try {
        await mongoose.connect(URL, {
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 10000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45
        })

        const endTime = ((new Date() - startTime) / 1000)
        console.log(`Database connected in ${endTime} sec`)

    } catch (error) {
        console.error(`Database connection failed: ${error}`)
    }
}

module.exports = database