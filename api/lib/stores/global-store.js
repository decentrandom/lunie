class GlobalStore {
  constructor(database) {
    this.db = database
    this.stores = []
    this.networks = []
    this.validatorsLookup = {
      /* hardcode code coming */
    }
    this.globalValidators = {}

    this.dataReady = new Promise((resolve) => {
      this.resolveReady = resolve
    })
    this.dataReady.then(() => {
      console.log(`Global Store is ready`)
    })
    this.getStores()
  }

  async getStores() {
    this.networks = await this.db.getNetworks()
    if (this.stores.length !== this.networks.length) {
      setTimeout(async () => await this.getStores(), 1000)
    } else {
      await this.getGlobalValidators()
      this.resolveReady()
    }
  }

  // checks if the particular network store already lives in this.stores.
  // If so, it will update it. Otherwise, it will just push it in.
  upsertStoreToGlobalStore(newStore) {
    // first check if it is already there In that case update store
    if (
      this.stores.length > 0 &&
      this.stores.find((store) => store.network.id === newStore.network.id)
    ) {
      this.stores = this.stores.reduce((updatedGlobalStores, store) => {
        if (store.network.id === newStore.network.id) {
          updatedGlobalStores.push(newStore)
          return updatedGlobalStores
        } else {
          updatedGlobalStores.push(store)
          return updatedGlobalStores
        }
      }, [])
      // otherwise push to the list
    } else {
      this.stores.push(newStore)
    }
  }

  calculateAverageUptimePercentage(name) {
    let aggregatedUptimePercentage = 0
    let validatorNetworks = 0
    this.validatorsLookup[name].forEach((operatorAddress) => {
      this.stores.forEach((store) => {
        if (store.validators[operatorAddress]) {
          let validator = store.validators[operatorAddress]
          aggregatedUptimePercentage =
            aggregatedUptimePercentage + validator.uptimePercentage
          validatorNetworks++
        }
      })
    })
    // divide aggregated uptimePercentage by number of networks
    const averageUptimePercentage =
      aggregatedUptimePercentage / validatorNetworks
    return averageUptimePercentage
  }

  async getGlobalValidators() {
    const premiumValidators = await this.db.getPremiumValidators()
    this.globalValidators = premiumValidators
    return premiumValidators.map((validator) =>
      this.globalValidatorReducer(validator)
    )
  }

  globalValidatorReducer(validator) {
    // add manually input validator data with on-chain calculated data
    return {
      ...validator,
      uptimePercentage: this.calculateAverageUptimePercentage(validator.name)
    }
  }
}

module.exports = GlobalStore
