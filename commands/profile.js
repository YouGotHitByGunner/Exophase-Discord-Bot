const { SlashCommandBuilder, ActionRow, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, messageLink } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { apiKey } = require('../config.json');
const wait = require('node:timers/promises').setTimeout;

const url = 'https://api.exophase.com';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Displays information about your Exophase profile')
		.addStringOption(option => option.setName('input').setDescription('Username')),
	async execute(interaction) {
		const input = interaction.options.getString('input');

		let config = {
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				'Accept-Encoding': 'gzip,deflate,compress'
			}
		};

		axios.get(`${url}/partner/v1/find-player/${input}`, config).then(async response => {
			console.log(response.data);
			const exophase = response.data;
			if (!exophase.success) {
				interaction.reply(`${input} is not a user on Exophase.`);
				return;
			}

			const row = new ActionRowBuilder();
			if (exophase.services.steam) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId('steamid')
						.setLabel('Steam')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji('<:steam:1053820117273813164>'),
				);
			}

			if (exophase.services.psn) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId('psnid')
						.setLabel('PSN')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji('<:playstation:1053822618685423726>'),
				);
			}

			if (exophase.services.xbox) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId('xboxid')
						.setLabel('Xbox')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji('<:xbox:1053823788208377886>'),
				);
			}
			const unearnedAchievements = exophase.possible_awards - exophase.earned_awards;
			const percentage = (exophase.earned_awards / exophase.possible_awards) * 100;
			const encodedUsername = encodeURIComponent(exophase.username);


			///Last Played Game implementation
			axios.get(`${url}/partner/v1/player/${exophase.playerid}/games`, config).then(async response => {
				console.log(response.data);
				const exophase2 = response.data;
				let percentageLastGame = (exophase2.games[0].earned_awards / exophase2.games[0].total_awards) * 100;
				if (isNaN(percentageLastGame)) {
					percentageLastGame = 0;
				}


				axios.get(`${url}/partner/v1/game/${exophase2.games[0].master_id}`, config).then(async response => {
				console.log(response.data);
				const exophase3 = response.data;


			const exampleEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle(`${exophase.displayname}'s Profile`)
				.setURL(`https://www.exophase.com/user/${encodedUsername}`)
				.setDescription(`<:rank:1053101438416470026> Cross-Platform Rank: ${exophase.rank_ww.toLocaleString("en-US")}\n<:completed:1053116800956641330> Completed Games: ${exophase.completed_games.toLocaleString("en-US")}\n<:trophy:1053286071343001630> Total Achievements Earned: ${exophase.earned_awards.toLocaleString("en-US")}\n<:percentage:1053278129021526046> Completion Percentage: ${percentage.toFixed(2)}% \n<:trophy:1053286071343001630> Unearned Achievements: ${unearnedAchievements.toLocaleString("en-US")}\n\nLast Activity: [${exophase3.game.title}](${exophase3.game.endpoint_awards}) (${exophase3.game.platforms[0].name})\n${exophase2.games[0].earned_awards} of ${exophase2.games[0].total_awards} (${percentageLastGame.toFixed()}%) achievements earned.`)
				.setThumbnail(`${exophase.avatar}`)
				.setImage(`${exophase3.game.images.l}`);

				let commandMessage;
			if (exophase.services.psn || exophase.services.xbox || exophase.services.steam) {
				commandMessage = await interaction.reply({ embeds: [exampleEmbed], components: [row] });
			} else {
				commandMessage = await interaction.reply({ embeds: [exampleEmbed] });
			}

			// Steam Embed implementation
			let steamEmbed;
			if (exophase.services.steam) {
				const unearnedSteamAchievements = exophase.services.steam.possible_awards - exophase.services.steam.earned_awards;
				const percentageSteam = (exophase.services.steam.earned_awards / exophase.services.steam.possible_awards) * 100;
				const encodedSteamUsername = encodeURIComponent(exophase.services.steam.username);
				steamEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`${exophase.services.steam.displayname}'s Steam Profile`)
					.setURL(`https://www.exophase.com/steam/user/${encodedSteamUsername}`)
					.setDescription(`<:rank:1053101438416470026> Steam Rank: ${exophase.services.steam.rank_ww.toLocaleString("en-US")}\n<:completed:1053116800956641330> Completed Games: ${exophase.services.steam.completed_games.toLocaleString("en-US")}\n<:trophy:1053286071343001630> Total Achievements Earned: ${exophase.services.steam.earned_awards.toLocaleString("en-US")}\n<:percentage:1053278129021526046> Completion Percentage: ${percentageSteam.toFixed(2)}% \n<:trophy:1053286071343001630> Unearned Achievements: ${unearnedSteamAchievements.toLocaleString("en-US")}`)
					.setThumbnail(`${exophase.services.steam.avatar}`)
			}

			// PSN Embed implementation
			let PsnEmbed;
			if (exophase.services.psn) {
				const unearnedPsnTrophies = exophase.services.psn.possible_awards - exophase.services.psn.earned_awards;
				const percentagePsn = (exophase.services.psn.earned_awards / exophase.services.psn.possible_awards) * 100;
				const encodedPsnUsername = encodeURIComponent(exophase.services.psn.username);
				PsnEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`${exophase.services.psn.displayname}'s PSN Profile`)
					.setURL(`https://www.exophase.com/psn/user/${encodedPsnUsername}`)
					.setDescription(`<:rank:1053101438416470026> PSN Rank: ${exophase.services.psn.rank_ww.toLocaleString("en-US")}\n<:completed:1053116800956641330> Completed Games: ${exophase.services.psn.completed_games.toLocaleString("en-US")}\n<:trophy:1053286071343001630> Total Trophies Earned: ${exophase.services.psn.earned_awards.toLocaleString("en-US")}\n<:percentage:1053278129021526046> Completion Percentage: ${percentagePsn.toFixed(2)}% \n<:trophy:1053286071343001630> Unearned Trophies: ${unearnedPsnTrophies.toLocaleString("en-US")}`)
					.setThumbnail(`${exophase.services.psn.avatar}`)
			}

			// Xbox Embed implementation
			let xboxEmbed
			if (exophase.services.xbox) {
				const unearnedXboxAchievements = exophase.services.xbox.possible_awards - exophase.services.xbox.earned_awards;
				const percentageXbox = (exophase.services.xbox.earned_awards / exophase.services.xbox.possible_awards) * 100;
				const encodedXboxUsername = encodeURIComponent(exophase.services.xbox.username);
				xboxEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`${exophase.services.xbox.displayname}'s Steam Profile`)
					.setURL(`https://www.exophase.com/xbox/user/${encodedXboxUsername}`)
					.setDescription(`<:rank:1053101438416470026> Xbox Rank: ${exophase.services.xbox.rank_ww.toLocaleString("en-US")}\n<:completed:1053116800956641330> Completed Games: ${exophase.services.xbox.completed_games.toLocaleString("en-US")}\n<:trophy:1053286071343001630> Total Achievements Earned: ${exophase.services.xbox.earned_awards.toLocaleString("en-US")}\n<:percentage:1053278129021526046> Completion Percentage: ${percentageXbox.toFixed(2)}% \n<:trophy:1053286071343001630> Unearned Achievements: ${unearnedXboxAchievements.toLocaleString("en-US")}`)
					.setThumbnail(`${exophase.services.xbox.avatar}`)
			}

			const crossPlatform = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('crossplatformid')
						.setLabel('Return to Previous Page')
						.setStyle(ButtonStyle.Secondary),
				);

			const collector = commandMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 150000 });
			collector.on('collect', async i => {

				if (i.user.id !== interaction.user.id) {
					return i.reply({ content: `You cannot navigate other people's commands.`, ephemeral: true });
				}

				if (i.customId === 'steamid') {
					await i.deferUpdate();
					await interaction.editReply({ embeds: [steamEmbed], components: [crossPlatform] });
				}

				if (i.customId === 'crossplatformid') {
					await i.deferUpdate();
					await interaction.editReply({ embeds: [exampleEmbed], components: [row] })
				}

				if (i.customId === 'psnid') {
					await i.deferUpdate();
					await interaction.editReply({ embeds: [PsnEmbed], components: [crossPlatform] })
				}

				if (i.customId === 'xboxid') {
					await i.deferUpdate();
					await interaction.editReply({ embeds: [xboxEmbed], components: [crossPlatform] })
				}
			});

			collector.on('end', collected => {
				console.log(`Collected ${collected.size} interactions.`);
			});
		})
	})
		}).catch(function (error) {
			console.log(error);
		});
	}
};