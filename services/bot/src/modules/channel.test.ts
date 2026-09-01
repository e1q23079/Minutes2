import {
  Collection,
  type Client,
  type VoiceBasedChannel,
  type VoiceState,
} from "discord.js";
import { describe, expect, it } from "vitest";
import * as Channel from "./channel.js";

describe("Channel", () => {
  describe("getEnterVCStatus", () => {
    it("ユーザーがボイスチャンネルに参加した場合、true を返す", () => {
      const oldState = {
        channelId: "123",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const newState = {
        channelId: "456",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const voice_channel_id = "456";
      const result = Channel.getEnterVCStatus(
        oldState,
        newState,
        voice_channel_id,
      );
      expect(result).toBe(true);
    });

    it("ユーザーがボイスチャンネルに参加していない場合、false を返す", () => {
      const oldState = {
        channelId: "123",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const newState = {
        channelId: "123",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const voice_channel_id = "456";
      const result = Channel.getEnterVCStatus(
        oldState,
        newState,
        voice_channel_id,
      );
      expect(result).toBe(false);
    });
  });

  describe("getLeaveVCStatus", () => {
    it("ユーザーがボイスチャンネルから退出した場合、true を返す", () => {
      const oldState = {
        channelId: "456",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const newState = {
        channelId: "123",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const voice_channel_id = "456";
      const result = Channel.getLeaveVCStatus(
        oldState,
        newState,
        voice_channel_id,
      );
      expect(result).toBe(true);
    });

    it("ユーザーがボイスチャンネルから退出していない場合、false を返す", () => {
      const oldState = {
        channelId: "123",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const newState = {
        channelId: "123",
        member: { user: { bot: false } },
      } as unknown as VoiceState;
      const voice_channel_id = "456";
      const result = Channel.getLeaveVCStatus(
        oldState,
        newState,
        voice_channel_id,
      );
      expect(result).toBe(false);
    });
  });

  describe("getVoiceChannel", () => {
    it("ボイスチャンネルが存在する場合、VoiceBasedChannel を返す", () => {
      const client = {
        channels: {
          cache: new Collection([["123", { isVoiceBased: () => true }]]),
        },
      } as unknown as Client;
      const channelId = "123";
      const result = Channel.getVoiceChannel(client, channelId);
      expect(result).toEqual({ isVoiceBased: expect.any(Function) });
    });

    it("ボイスチャンネルが存在しない場合、null を返す", () => {
      const client = {
        channels: {
          cache: new Collection(),
        },
      } as unknown as Client;
      const channelId = "123";
      const result = Channel.getVoiceChannel(client, channelId);
      expect(result).toBeNull();
    });

    it("ボイスチャンネルがボイスベースでない場合、null を返す", () => {
      const client = {
        channels: {
          cache: new Collection([["123", { isVoiceBased: () => false }]]),
        },
      } as unknown as Client;
      const channelId = "123";
      const result = Channel.getVoiceChannel(client, channelId);
      expect(result).toBeNull();
    });

    it("ボイスチャンネルの取得中にエラーが発生した場合、null を返す", () => {
      const client = {
        channels: {
          cache: new Collection([["123", null]]),
        },
      } as unknown as Client;
      const channelId = "123";
      const result = Channel.getVoiceChannel(client, channelId);
      expect(result).toBeNull();
    });
  });

  describe("getVoiceChannelStatus", () => {
    it("ボイスチャンネルが空の場合、'empty' を返す", () => {
      const channel = {
        members: new Collection(),
      } as unknown as VoiceBasedChannel;
      const result = Channel.getVoiceChannelStatus(channel);
      expect(result).toBe("empty");
    });

    it("ボイスチャンネルに 1 人のユーザーがいる場合、'one' を返す", () => {
      const channel = {
        members: new Collection([["user1", { user: { bot: false } }]]),
      } as unknown as VoiceBasedChannel;
      const result = Channel.getVoiceChannelStatus(channel);
      expect(result).toBe("one");
    });

    it("ボイスチャンネルに複数のユーザーがいる場合、'many' を返す", () => {
      const channel = {
        members: new Collection([
          ["user1", { user: { bot: false } }],
          ["user2", { user: { bot: false } }],
        ]),
      } as unknown as VoiceBasedChannel;
      const result = Channel.getVoiceChannelStatus(channel);
      expect(result).toBe("many");
    });
  });
});
