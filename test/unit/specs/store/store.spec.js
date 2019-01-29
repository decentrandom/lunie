import { storeUpdateHandler, loadPersistedState } from "renderer/vuex/store"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

jest.mock(`renderer/vuex/modules/index.js`, () => () => ({}))

const mockState = {
  user: {
    address: `xxx`
  },
  connection: {
    lastHeader: {
      chain_id: `test-net`
    }
  },
  transactions: {
    wallet: [],
    staking: []
  },
  wallet: {
    balances: []
  },
  delegation: {
    loaded: true,
    committedDelegates: {
      [lcdClientMock.validators[1]]: {
        validator_addr: lcdClientMock.validators[1],
        balance: { amount: 1 },
        min_time: new Date().toUTCString()
      }
    },
    unbondingDelegations: {}
  },
  delegates: {
    delegates: lcdClientMock.state.candidates
  },
  keybase: {
    identities: {}
  },
  stakingParameters: {},
  pool: {},
  proposals: {},
  deposits: {},
  votes: {},
  governanceParameters: {}
}

describe(`Store`, () => {
  beforeEach(async () => {
    localStorage.setItem(`store_test-net_xxx`, undefined)

    jest.useFakeTimers()
  })

  // DEFAULT

  it(`should persist balances et al if the user is logged in`, async () => {
    storeUpdateHandler({ type: `setWalletBalances` }, mockState, null)
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    expect(localStorage.getItem(`store_test-net_xxx`)).toBeTruthy()
  })

  it(`should not update cache if not logged in`, async () => {
    storeUpdateHandler(
      { type: `setWalletBalances` },
      Object.assign({}, mockState, {
        user: {
          address: null
        }
      }),
      null
    )
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    expect(localStorage.getItem(`store_test-net_xxx`)).toBeFalsy()
  })

  it(`should restore balances et al after logging in`, async () => {
    localStorage.setItem(`store_test-net_xxx`, `{}`)

    let replaceState = jest.fn()
    loadPersistedState.call(
      { replaceState },
      { state: mockState, commit: jest.fn() }
    )
    expect(replaceState).toHaveBeenCalled()
  })

  it(`should restore delegates and put committed ones in the cart`, async () => {
    localStorage.setItem(`store_test-net_xxx`, JSON.stringify(mockState))

    const commit = jest.fn()
    loadPersistedState.call(
      { replaceState: jest.fn() },
      { state: mockState, commit }
    )
    expect(commit).toHaveBeenCalledTimes(1)
  })

  it(`should throttle updating the store cache`, async () => {
    jest.useFakeTimers()

    const pending = setTimeout(() => {}, 10000)
    storeUpdateHandler({ type: `setWalletBalances` }, mockState, pending)

    // not updating yet, as it waits if there are more updates incoming
    expect(localStorage.getItem(`store_test-net_xxx`)).toBeFalsy()

    jest.runAllTimers() // clear pending
    jest.runAllTimers() // waited for later update

    expect(localStorage.getItem(`store_test-net_xxx`)).toBeTruthy()
  })

  it(`should not crash if the stored cache is invalid`, async () => {
    jest.spyOn(console, `error`).mockImplementationOnce(() => {})

    localStorage.setItem(`store_test-net_xxx`, `xxx`)
    loadPersistedState.call(
      { replaceState: jest.fn() },
      { state: mockState, commit: jest.fn() }
    )
  })
})
