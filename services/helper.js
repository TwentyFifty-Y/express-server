function checkId(id) {
    if (!id) {
        throw new Error('No id provided. Please provide an id and try again.');
    }
}

module.exports = {
    checkId
}