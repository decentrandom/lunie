"use strict"

import { shallowMount } from "@vue/test-utils"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"

describe(`ModalWithdrawRewards`, () => {
  let wrapper, $store
  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        stakingDenom: "STAKE",
        network: "cosmos-hub-mainnet",
        address: "cosmos1234"
      }
    }

    wrapper = shallowMount(ModalWithdrawRewards, {
      mocks: {
        $store
      }
    })
    wrapper.setData({
      rewards: [
        {
          denom: `NOTSTAKE`,
          amount: 2,
          validator: {
            operatorAddress: `cosmosvaloper13`
          }
        },
        {
          denom: `STAKE`,
          amount: 3,
          validator: {
            operatorAddress: `cosmosvaloper12`
          }
        }
      ]
    })
  })

  // the snapshot is unreliable on CircleCI
  xit(`should show the withdraw rewards modal`, async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`opens the action modal`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalWithdrawRewards.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`adds up all denom rewards to display as totalRewards`, () => {
    const self = {
      rewards: [
        {
          denom: `STAKE`,
          amount: 1,
          validator: {
            operatorAddress: `cosmosvaloper12`
          }
        },
        {
          denom: `STAKE`,
          amount: 0.5,
          validator: {
            operatorAddress: `cosmosvaloper13`
          }
        },
        {
          denom: `NOTSTAKE`,
          amount: 2,
          validator: {
            operatorAddress: `cosmosvaloper12`
          }
        },
        {
          denom: `NOTSTAKE`,
          amount: 2,
          validator: {
            operatorAddress: `cosmosvaloper13`
          }
        }
      ],
      top5Validators: ["cosmosvaloper12", "cosmosvaloper13"]
    }
    const totalRewards = ModalWithdrawRewards.computed.totalRewards.call(self)
    expect(totalRewards).toEqual([
      { amount: 4, denom: "NOTSTAKE" },
      { amount: 1.5, denom: "STAKE" }
    ])
  })

  it(`should display message when withdrawing from multiple validators`, () => {
    expect(wrapper.find(`.withdraw-limit`).exists()).toBe(true)
  })

  it(`should return the staking denom if staking denom has any available balance`, () => {
    const self = {
      balances: [
        {
          denom: "STAKE",
          amount: 1
        }
      ]
    }
    const feeDenom = ModalWithdrawRewards.computed.feeDenom.call(self)
    expect(feeDenom).toEqual(`STAKE`)
  })

  it(`should return the first balance denom in the balances array with available balance if staking denom has no available balance`, () => {
    const self = {
      balances: [
        {
          denom: "STAKE",
          amount: 0
        },
        {
          denom: "TOKEN",
          amount: 0
        },
        {
          denom: "TOKEN2",
          amount: 1
        }
      ]
    }
    const feeDenom = ModalWithdrawRewards.computed.feeDenom.call(self)
    expect(feeDenom).toEqual(`TOKEN2`)
  })

  describe("Submission Data for Delegating", () => {
    it("should return correct transaction data for delegating", () => {
      expect(
        ModalWithdrawRewards.computed.transactionData.call({
          totalRewards: [
            { amount: 4, denom: "NOTSTAKE" },
            { amount: 1.5, denom: "STAKE" }
          ]
        })
      ).toEqual({
        type: "ClaimRewardsTx",
        amounts: [
          {
            amount: 4,
            denom: "NOTSTAKE"
          },
          {
            amount: 1.5,
            denom: "STAKE"
          }
        ],
        displayAmounts: [
          {
            amount: 4,
            denom: "NOTSTAKE"
          },
          {
            amount: 1.5,
            denom: "STAKE"
          }
        ]
      })
    })

    it("should return correct notification message for delegating", () => {
      expect(wrapper.vm.notifyMessage).toEqual({
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      })
    })
  })
})
