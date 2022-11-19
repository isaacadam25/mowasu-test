const generateRandomNumber = (min = 0, max = 500000) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num.toString().padStart(6, "0");
}

module.exports = {
    generateRandomNumber
}