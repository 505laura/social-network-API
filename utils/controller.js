const genericController = (f) => async(req, res) => {
    try {
        const data = await f(req);
        if(typeof data === 'string') {
            return res.status(200).send({message: data});
        }
        return res.status(200).json(data);
    } catch (err) {
        // console.error(err);
        return res.status(err.code < 599 ? err.code : 500).send({message: err.message ?? 'Something went wrong'});
    }
};

module.exports = {genericController};
