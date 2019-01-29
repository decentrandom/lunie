import setup from "../../../helpers/vuex-setup"
import TabProposals from "renderer/components/governance/TabProposals"
const lcdClientMock = require(`renderer/connectors/lcdClientMock.js`)

const { tallies } = lcdClientMock.state

describe(`TabProposals`, () => {
  const { mount } = setup()

  it(`has the expected html structure`, async () => {
    const { wrapper } = mount(TabProposals, {
      getters: {
        proposals: () => ({
          loading: false,
          loaded: false,
          proposals: lcdClientMock.state.proposals,
          tallies
        }),
        connected: () => true
      },
      stubs: {
        "tm-data-connecting": true
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if still connecting`, async () => {
    const { wrapper } = mount(TabProposals, {
      getters: {
        proposals: () => ({
          loading: false,
          loaded: false,
          proposals: {},
          tallies: {}
        }),
        connected: () => false
      },
      stubs: {
        "tm-data-connecting": true
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    const { wrapper } = mount(TabProposals, {
      getters: {
        proposals: () => ({
          loading: true,
          loaded: false,
          proposals: {},
          tallies: {}
        }),
        connected: () => true
      },
      stubs: {
        "tm-data-loading": true
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    const { wrapper } = mount(TabProposals, {
      getters: {
        proposals: () => ({
          loading: false,
          loaded: false,
          tallies: {},
          proposals: {}
        }),
        connected: () => true
      },
      stubs: {
        "tm-data-loading": true
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
