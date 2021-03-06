const utils = require('../utils')

class RemoteDataStore {

    constructor() {
    }

    async getTransactions(executionPermission, address) {
        const path = `wallets/${address}/transactions/received?limit=100`
        let response = await this.getAllPagesOf(executionPermission, path)

        const result = []
        try {
            response.forEach(transaction => {
                const type = parseInt(transaction.type)
                const date = transaction.timestamp.unix
                const senderPublicKey = transaction.senderPublicKey
                const transactionId = transaction.id

                let amount = 0.0
                switch (type) {
                    case 0:
                        amount = parseFloat(transaction.amount)
                        break;
                    case 6:
                        const payments = transaction.asset.payments
                        payments.forEach(payment => {
                            if (payment.recipientId === address) {
                                amount = parseFloat(payment.amount)
                            }
                        })
                        break;
                }

                result.push({
                    amount: amount,
                    date: date,
                    transactionId: transactionId,
                    senderPublicKey: senderPublicKey,
                })
            })
        } catch (error) {
            console.log(error)
            throw error
        }
        return result
    }

    async getVotes(executionPermission, address) {
        const path = `wallets/${address}/votes?limit=100`
        let response = await this.getAllPagesOf(executionPermission, path)

        const result = []
        try {
            const delegateIds = new Set()
            response.forEach(transaction => {
                const vote = transaction.asset.votes[0]
                const delegatePublicKey = vote.substr(1, vote.length)
                delegateIds.add(delegatePublicKey)
            })

            const delegates = await this.getDelegates(delegateIds)

            response.forEach(transaction => {
                    const date = transaction.timestamp.unix
                    const vote = transaction.asset.votes[0]
                    const isDownVote = vote[0] === '-'
                    const delegatePublicKey = vote.substr(1, vote.length)
                    const delegateName = delegates.get(delegatePublicKey)

                    result.push({
                        delegateName: delegateName,
                        delegatePublicKey: delegatePublicKey,
                        date: date,
                        isDownVote: isDownVote
                    })
                }
            )
        } catch (error) {
            console.log(error)
            throw error
        }

        return result
    }

    async getDelegates(delegateIds) {
        const result = new Map()
        try {
            for (const delegateId of delegateIds) {
                const path = `delegates?publicKey=` + delegateId
                let response = await walletApi.peers.current.get(path, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })

                result.set(delegateId, response.data[0].username)
            }
        } catch (error) {
            console.log(error)
            throw error
        }

        return result
    }

    async getAllPagesOf(executionPermission, requestPath) {
        let page = 1
        let data = []
        let result = []
        do {
            let response = await walletApi.peers.current.get(requestPath + `&page=${page}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            data = response.data
            Array.prototype.push.apply(result, data)
            page++
        } while (!executionPermission.canceled && data && data.length > 0)

        return result
    }

    getStakingRewards(transactions, votes) {
        let result = []
        if (votes.length === 0) {
            return result
        }

        let lastVoteTime = votes[votes.length - 1].date
        let since = 0
        while (since < lastVoteTime) {
            const res = this.getStakingRewardsSince(transactions, votes, since)
            Array.prototype.push.apply(result, res.result)
            since = res.downVoteTime
        }

        return result
    }

    getStakingRewardsSince(transactions, votes, since) {
        const result = []
        const upVote = votes.find(vote => !vote.isDownVote && since < vote.date)
        const downVote = votes.find(vote => vote.isDownVote && vote.delegatePublicKey === upVote.delegatePublicKey)

        let downVoteTime = Date.now()
        if (downVote) {
            downVoteTime = downVote.date
        }

        transactions.forEach(transaction => {
            if (upVote.date <= transaction.date && transaction.date < downVoteTime
                && transaction.senderPublicKey === upVote.delegatePublicKey) {

                Object.assign(transaction, {delegateName: upVote.delegateName})

                result.push(transaction)
            }
        })

        return {result: result, downVoteTime: downVoteTime}
    }

    async loadPrices(transactions) {
        const prices = []

        try {
            if (transactions.length > 0) {
                const profile = walletApi.profiles.getCurrent()
                const lastTransactionTime = transactions[transactions.length - 1].date
                const fromTime = Math.round(transactions[0].date)
                const query = {
                    fsym: profile.network.token,
                    tsym: profile.currency,
                    toTs: lastTransactionTime,
                    limit: utils.days_since(fromTime)
                }

                const {body} = await walletApi.http.get('https://min-api.cryptocompare.com/data/histoday', {
                    query: query,
                    json: true
                })

                Array.prototype.push.apply(prices, body.Data)
            }
        } catch (error) {
            console.log(error)
            throw error
        }

        return prices
    }
}

module.exports = RemoteDataStore
