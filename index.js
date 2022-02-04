const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')

module.exports = class FavoriteChannelCommand extends Plugin {
  async startPlugin() {
    const GetFavoriteChannels = await getModule([ 'getFavoriteChannels' ])
    const SetFavoriteChannels = await getModule([ 'addFavoriteChannel' ])
    const GetChannels = await getModule([ 'getLastSelectedChannelId' ])

    powercord.api.commands.registerCommand({
      command: 'favorite',
      description: 'Toggles channel favorite status',
      usage: '{c}',
      executor: () => {
        let channelId = GetChannels.getChannelId()
        let isFavorite = GetFavoriteChannels.isFavorite(channelId)

        if (isFavorite)
          SetFavoriteChannels.removeFavoriteChannel(channelId)
        else
          SetFavoriteChannels.addFavoriteChannel(channelId)

        return {
          send: false,
          result: `${isFavorite ? "Removed from" : "Added to"} favorite channels.`
        }
      }
    })
  }

  pluginWillUnload() {
    powercord.api.commands.unregisterCommand('favorite')
  }
}
