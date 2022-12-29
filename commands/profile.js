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
		.addStringOption(option => option.setName('username').setDescription("Enter the user's Exophase username")),
	async execute(interaction) {
		const input = interaction.options.getString('username');

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
			let percentage = (exophase.earned_awards / exophase.possible_awards) * 100;
			if (isNaN(percentage)) {
				percentage = 0;
			}
			const encodedUsername = encodeURIComponent(exophase.username);


			///Last Played Game implementation
			axios.get(`${url}/partner/v1/player/${exophase.playerid}/games`, config).then(async response => {
				console.log(response.data);
				const exophase2 = response.data;
				let percentageLastGame = (exophase2.games[0].earned_awards / exophase2.games[0].total_awards) * 100;
				if (isNaN(percentageLastGame)) {
					percentageLastGame = 0;
				}

				let progressBar;
				if (percentageLastGame === 100) {
					progressBar = '<:100_part1:1057137930038169630><:100_part2:1057137931392909393><:100_part2:1057137931392909393><:100_part2:1057137931392909393><:100_part2:1057137931392909393><:100_part2:1057137931392909393><:100_part2:1057137931392909393><:100_part2:1057137931392909393><:100_part2:1057137931392909393><:100_part3:1057137932860936232>';
				} else if (percentageLastGame > 90) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 80) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 70) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 60) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 50) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 40) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 30) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:progress_part2:1057139924870111262><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 20) {
					progressBar = '<:progress_part1:1057139923427266580><:progress_part2:1057139924870111262><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else if (percentageLastGame > 10) {
					progressBar = '<:progress_part1:1057139923427266580><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				} else {
					progressBar = '<:0_part1:1057139918977114212><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part2:1057139920478683186><:0_part3:1057139922005397615>';
				}

				axios.get(`${url}/partner/v1/game/${exophase2.games[0].master_id}`, config).then(async response => {
				console.log(response.data);
				const exophase3 = response.data;


			const exampleEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle(`${exophase.displayname}'s Profile`)
				.setURL(`https://www.exophase.com/user/${encodedUsername}`)
				.setThumbnail(`${exophase.avatar}`)
				.setImage(`${exophase3.game.images.l}`)
				.setFields (
					{ name: '<:rank:1053101438416470026> Global Rank:', value: `${exophase.rank_ww.toLocaleString("en-US")}`, inline: true},
					{ name: '<:completed:1053116800956641330> Completed Games:', value: `${exophase.completed_games.toLocaleString("en-US")}`, inline: true},
					{ name: '<:percentagev3:1055619901450092556> Completion:', value: `${percentage.toFixed(2)}%`, inline: true},
					{ name: '<:trophy:1053286071343001630> Awards Earned:', value: `${exophase.earned_awards.toLocaleString("en-US")}`, inline: true},
					{ name: '<:trophyunearned:1055617148430598245> Unearned Awards:', value: `${unearnedAchievements.toLocaleString("en-US")}`, inline: true},
					{ name: 'Last Activity:', value: `[${exophase3.game.title}](${exophase3.game.endpoint_awards}) (${exophase3.game.platforms[0].name})\n${progressBar}\n${exophase2.games[0].earned_awards} of ${exophase2.games[0].total_awards} (${percentageLastGame.toFixed()}%) achievements earned.`},
					{ name: 'Last Played:', value: `<t:${exophase2.games[0].lastplayed}:D>`},
				);

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
				let percentageSteam = (exophase.services.steam.earned_awards / exophase.services.steam.possible_awards) * 100;
				if (isNaN(percentageSteam)) {
					percentageSteam = 0;
				}
				const encodedSteamUsername = encodeURIComponent(exophase.services.steam.username);
				steamEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`${exophase.services.steam.displayname}'s Steam Profile`)
					.setURL(`https://www.exophase.com/steam/user/${encodedSteamUsername}`)
					.setThumbnail(`${exophase.services.steam.avatar}`)
					.setFields(
						{ name: '<:rank:1053101438416470026> Steam Rank:', value: `${exophase.services.steam.rank_ww.toLocaleString("en-US")}`, inline: true},
						{ name: '<:completed:1053116800956641330> Completed Games:', value: `${exophase.services.steam.completed_games.toLocaleString("en-US")}`, inline: true},
						{ name: '<:percentagev3:1055619901450092556> Completion:', value: `${percentageSteam.toFixed(2)}%`, inline: true},
						{ name: '<:trophy:1053286071343001630> Achievements Earned:', value: `${exophase.services.steam.earned_awards.toLocaleString("en-US")}`, inline: true},
						{ name: '<:trophyunearned:1055617148430598245> Unearned Achievements:', value: `${unearnedSteamAchievements.toLocaleString("en-US")}`, inline: true},
					)
			}

			// PSN Embed implementation
			let PsnEmbed;
			if (exophase.services.psn) {
				const unearnedPsnTrophies = exophase.services.psn.possible_awards - exophase.services.psn.earned_awards;
				let percentagePsn = (exophase.services.psn.earned_awards / exophase.services.psn.possible_awards) * 100;
				if (isNaN(percentagePsn)) {
					percentagePsn = 0;
				}
				const encodedPsnUsername = encodeURIComponent(exophase.services.psn.username);
				PsnEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`${exophase.services.psn.displayname}'s PSN Profile`)
					.setURL(`https://www.exophase.com/psn/user/${encodedPsnUsername}`)
					.setThumbnail(`${exophase.services.psn.avatar}`)
					.setFields(
						{ name: '<:rank:1053101438416470026> PSN Rank:', value: `${exophase.services.psn.rank_ww.toLocaleString("en-US")}`, inline: true},
						{ name: '<:completed:1053116800956641330> Completed Games:', value: `${exophase.services.psn.completed_games.toLocaleString("en-US")}`, inline: true},
						{ name: '<:percentagev3:1055619901450092556> Completion:', value: `${percentagePsn.toFixed(2)}%`, inline: true},
						{ name: '<:trophy:1053286071343001630> Trophies Earned:', value: `${exophase.services.psn.earned_awards.toLocaleString("en-US")}`, inline: true},
						{ name: '<:trophyunearned:1055617148430598245> Unearned Trophies:', value: `${unearnedPsnTrophies.toLocaleString("en-US")}`, inline: true}
					)
			}

			// Xbox Embed implementation
			let xboxEmbed
			if (exophase.services.xbox) {
				const unearnedXboxAchievements = exophase.services.xbox.possible_awards - exophase.services.xbox.earned_awards;
				let percentageXbox = (exophase.services.xbox.earned_awards / exophase.services.xbox.possible_awards) * 100;
				if (isNaN(percentageXbox)) {
					percentageXbox = 0;
				}
				const encodedXboxUsername = encodeURIComponent(exophase.services.xbox.username);
				xboxEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`${exophase.services.xbox.displayname}'s Steam Profile`)
					.setURL(`https://www.exophase.com/xbox/user/${encodedXboxUsername}`)
					.setThumbnail(`${exophase.services.xbox.avatar}`)
					.setFields(
						{ name: '<:rank:1053101438416470026> Xbox Rank:', value: `${exophase.services.xbox.rank_ww.toLocaleString("en-US")}`, inline: true},
						{ name: '<:completed:1053116800956641330> Completed Games:', value: `${exophase.services.xbox.completed_games.toLocaleString("en-US")}`, inline: true},
						{ name: '<:percentagev3:1055619901450092556> Completion:', value: `${percentageXbox.toFixed(2)}%`, inline: true},
						{ name: '<:trophy:1053286071343001630> Achievements Earned:', value: `${exophase.services.xbox.earned_awards.toLocaleString("en-US")}`, inline: true},
						{ name: '<:trophyunearned:1055617148430598245> Unearned Achievements:', value: `${unearnedXboxAchievements.toLocaleString("en-US")}`, inline: true},
					)
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
				interaction.editReply({ components: [] }).catch(error => {
					if (error.code !== 10008) {
						console.error('Failed to delete the buttons:', error);
					}
				})
			});
		})
	})
		}).catch(function (error) {
			console.log(error);
		});
	}
};