// Part of this file is a copy of https://github.com/dated/delegate-calculator-plugin/blob/master/src/components/Header.js
const utils = require('../utils')
const InfoIcon = require('../../images/infoIcon')
const Keys = require('../Keys')
const Strings = require('../Strings')

module.exports = {
    template: `
    <div class="flex w-full items-center mb-3 py-8 px-10 rounded-lg bg-theme-feature">
      <div
        v-if="wallet"
        class="flex items-center"
      >
        <WalletIdenticon
          :value="wallet.address"
          :size="50"
          class="flex-inline mr-4"
        />

        <div class="flex flex-col pr-12">
          <span class="text-sm text-theme-page-text-light font-semibold mb-1">
            {{ addressLabel }}
          </span>

          <MenuDropdown
            ref="address"
            :items="addresses"
            :value="wallet.address"
            :pin-to-input-width="true"
            @select="emitAddressChange"
          />
          
          <span class="font-bold mt-1">
            {{ formatCurrency(wallet.balance, profile.network.token) }}
          </span>
        </div>
      </div>
        
      <div v-if="!isLoading" class="flex flex-col border-l border-theme-line-separator px-12" >
          <span class="text-sm text-theme-page-text-light font-semibold mb-1">
              {{ periodLabel }}
          </span>
    
          <MenuDropdown
              ref="period"
              :disabled="isLoading"
              :items="years"
              :value="selectedYear"
              container-classes="whitespace-no-wrap"
              @select="onYearChanged" />
      </div>
            
      <div
        v-if="!isLoading && rewardSum" 
        class="flex flex-col border-l border-theme-line-separator px-12" >
          
        <span class="text-sm text-theme-page-text-light font-semibold mb-1">
              {{ receivedStakingRewards }}
        </span>
            
        <span class="font-bold text-green">
              {{ formatCurrency(rewardSum, profile.currency) }}
        </span>
      </div>
            
      <div v-if="!isLoading" class="flex items-center ml-auto">
        <button
            class="ContactAll__CreateButton mr-4"
            @click="onReloadClicked"
            v-tooltip="{
                content: reloadLabel,
                trigger: 'hover'
            }">
                  
            <span class="ContactAll__CreateButton__icon">
                    
                <SvgIcon
                        name="reload"
                    view-box="0 0 15 15"
                    />
             </span>
        </button>
      </div>
            
      <div v-if="!isLoading" class="flex items-center" >
          <button
              class="ContactAll__CreateButton mr-4"
              @click="onExportClicked"
              v-tooltip="{
                content: exportLabel,
                trigger: 'hover'
              }">
                  
              <span class="ContactAll__CreateButton__icon">
                  
                  <SvgIcon
                      name="arrow-export"
                      view-box="0 0 15 15"
                  />
              </span>
          </button>
      </div>
          
      <div v-if="!isLoading" class="flex items-center" >
          <button
              class="ContactAll__CreateButton mr-4"
              @click="onInfoClicked"
              v-tooltip="{
                content: infoLabel,
                trigger: 'hover'
              }">
                  
              <span class="ContactAll__CreateButton__icon">
                  
                  <InfoIcon view-box="0 0 15 15"/>
              </span>
          </button>
      </div>
        
      <div v-else class="flex flex-col border-l border-theme-line-separator px-12" >
           <span class="text-sm text-theme-page-text-light font-semibold mb-1">
              {{ periodLabel }}
          </span>
          <span class="font-semibold">
              {{ selectedYear }}
          </span>
      </div>
    </div>
  `,

    data: () => ({
        receivedStakingRewards: '',
        periodLabel: '',
        addressLabel: '',
        exportLabel: '',
        reloadLabel: '',
        infoLabel: '',
    }),

    components: {
        InfoIcon
    },

    props: {
        wallet: {
            type: Object,
            required: true
        },
        isLoading: {
            type: Boolean,
            required: true
        },
        selectedYear: {
            type: String,
            required: true
        },
        years: {
            type: Object,
            required: true
        },
        rewardSum: {
            type: Number,
            required: false
        },
        callback: {
            type: Function,
            required: true
        }
    },

    computed: {
        profile() {
            return walletApi.profiles.getCurrent()
        },

        addresses() {
            return this.profile.wallets.map(wallet => wallet.address)
        },
    },

    methods: {
        emitAddressChange(address) {
            this.callback(Keys.EVENT_ADDRESS_CHANGED, {address})
        },

        onYearChanged(year) {
            this.callback(Keys.EVENT_YEAR_CHANGED, {year})
        },

        onReloadClicked() {
            this.callback(Keys.EVENT_RELOAD)
        },

        onExportClicked() {
            this.callback(Keys.EVENT_EXPORT)
        },

        onInfoClicked() {
            this.callback(Keys.EVENT_INFO)
        },

        formatCurrency(value, currency) {
            return utils.formatter_currency(value, currency, this.profile.language)
        },
    },

    mounted() {
        this.receivedStakingRewards = Strings.getString(this.profile, Strings.RECEIVED_STAKING_REWARDS)
        this.periodLabel = Strings.getString(this.profile, Strings.PERIOD)
        this.addressLabel = Strings.getString(this.profile, Strings.ADDRESS)
        this.exportLabel = Strings.getString(this.profile, Strings.TOOLTIP_EXPORT)
        this.reloadLabel = Strings.getString(this.profile, Strings.TOOLTIP_RELOAD)
        this.infoLabel = Strings.getString(this.profile, Strings.INFO)
    }
}