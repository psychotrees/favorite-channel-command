const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { getModule, React, constants: { ChannelTypes } } = require('powercord/webpack')
const { findInReactTree, getOwnerInstance } = require('powercord/util')

module.exports = class FavoriteChannelCommand extends Plugin {
  async startPlugin() {
    const GetFavoriteChannels = await getModule([ 'getFavoriteChannels' ])
    const SetFavoriteChannels = await getModule([ 'addFavoriteChannel' ])
    const Menu = await getModule(m => m?.default?.displayName === "Menu")

    inject('favorite-channel-cm', Menu, 'default', args => {
      const [ { navId } ] = args

      if (!(navId == 'channel-context' || navId == 'user-context'))
        return args

      const itemAlreadyInjected = findInReactTree(args[0].children, child => child?.props?.id === 'favorite-channel')

      if (!itemAlreadyInjected) {
        var channel

        // idk this is from 'hidechannels'
        if (document.querySelector('#' + navId)) {
          const instance = getOwnerInstance(document.querySelector('#' + navId))
          channel = (instance?._reactInternals || instance?._reactInternalFiber)?.child.child.child.return?.memoizedProps.children.props.channel
        }

        if (!channel)
          return args

        if (channel.type === ChannelTypes.GUILD_CATEGORY || channel.type === ChannelTypes.GUILD_DIRECTORY || channel.type === ChannelTypes.GUILD_STORE)
          return args

        let isFavorite = GetFavoriteChannels.isFavorite(channel.id)

        const FavoriteMenuItem = React.createElement(Menu.MenuItem, {
          id: 'favorite-channel',
          label: (isFavorite ? 'Unfavorite' : 'Favorite') + (navId == 'channel-context' ? ' Channel' : ' DM'),
          action: () => {
            SetFavoriteChannels.toggleFavoriteChannel(channel.id)
          }
        })

        args[0].children.splice(1, 0, React.createElement(Menu.MenuGroup, {}, FavoriteMenuItem))

        if (!(channel.type === ChannelTypes.GUILD_VOICE || channel.type === ChannelTypes.GUILD_STAGE_VOICE))
          args[0].children.splice(1, 0, React.createElement(Menu.MenuSeparator))
      }

      return args
    }, true)

    Menu.default.displayName = 'Menu'
  }

  pluginWillUnload() {
    uninject('favorite-channel-cm')
  }
}
