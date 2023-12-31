// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Campaign extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Campaign entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Campaign must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Campaign", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): Campaign | null {
    return changetype<Campaign | null>(
      store.get_in_block("Campaign", id.toHexString())
    );
  }

  static load(id: Bytes): Campaign | null {
    return changetype<Campaign | null>(store.get("Campaign", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get campaignId(): BigInt {
    let value = this.get("campaignId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set campaignId(value: BigInt) {
    this.set("campaignId", Value.fromBigInt(value));
  }

  get owner(): Bytes {
    let value = this.get("owner");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set owner(value: Bytes) {
    this.set("owner", Value.fromBytes(value));
  }

  get ownerTwitterUserId(): BigInt {
    let value = this.get("ownerTwitterUserId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set ownerTwitterUserId(value: BigInt) {
    this.set("ownerTwitterUserId", Value.fromBigInt(value));
  }

  get name(): string {
    let value = this.get("name");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get description(): string {
    let value = this.get("description");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set description(value: string) {
    this.set("description", Value.fromString(value));
  }

  get tweetString(): string {
    let value = this.get("tweetString");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set tweetString(value: string) {
    this.set("tweetString", Value.fromString(value));
  }

  get tokensPerLike(): BigInt {
    let value = this.get("tokensPerLike");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set tokensPerLike(value: BigInt) {
    this.set("tokensPerLike", Value.fromBigInt(value));
  }

  get tokensPerRetweet(): BigInt {
    let value = this.get("tokensPerRetweet");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set tokensPerRetweet(value: BigInt) {
    this.set("tokensPerRetweet", Value.fromBigInt(value));
  }

  get rewardsLeft(): BigInt {
    let value = this.get("rewardsLeft");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set rewardsLeft(value: BigInt) {
    this.set("rewardsLeft", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get participantCount(): BigInt {
    let value = this.get("participantCount");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set participantCount(value: BigInt) {
    this.set("participantCount", Value.fromBigInt(value));
  }

  get participants(): UserCampaignLoader {
    return new UserCampaignLoader(
      "Campaign",
      this.get("id")!
        .toBytes()
        .toHexString(),
      "participants"
    );
  }

  get rewardLogs(): RewardLogLoader {
    return new RewardLogLoader(
      "Campaign",
      this.get("id")!
        .toBytes()
        .toHexString(),
      "rewardLogs"
    );
  }
}

export class RewardLog extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save RewardLog entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type RewardLog must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("RewardLog", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): RewardLog | null {
    return changetype<RewardLog | null>(
      store.get_in_block("RewardLog", id.toHexString())
    );
  }

  static load(id: Bytes): RewardLog | null {
    return changetype<RewardLog | null>(
      store.get("RewardLog", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get campaign(): Bytes {
    let value = this.get("campaign");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set campaign(value: Bytes) {
    this.set("campaign", Value.fromBytes(value));
  }

  get wallet(): Bytes {
    let value = this.get("wallet");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set wallet(value: Bytes) {
    this.set("wallet", Value.fromBytes(value));
  }

  get tweetId(): BigInt {
    let value = this.get("tweetId");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set tweetId(value: BigInt) {
    this.set("tweetId", Value.fromBigInt(value));
  }

  get tokensRewarded(): BigInt {
    let value = this.get("tokensRewarded");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set tokensRewarded(value: BigInt) {
    this.set("tokensRewarded", Value.fromBigInt(value));
  }

  get likesRewarded(): BigInt {
    let value = this.get("likesRewarded");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set likesRewarded(value: BigInt) {
    this.set("likesRewarded", Value.fromBigInt(value));
  }

  get retweetsRewarded(): BigInt {
    let value = this.get("retweetsRewarded");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set retweetsRewarded(value: BigInt) {
    this.set("retweetsRewarded", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }
}

export class User extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save User entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type User must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("User", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): User | null {
    return changetype<User | null>(
      store.get_in_block("User", id.toHexString())
    );
  }

  static load(id: Bytes): User | null {
    return changetype<User | null>(store.get("User", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get wallet(): Bytes {
    let value = this.get("wallet");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set wallet(value: Bytes) {
    this.set("wallet", Value.fromBytes(value));
  }

  get totalRewardsClaimed(): BigInt {
    let value = this.get("totalRewardsClaimed");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set totalRewardsClaimed(value: BigInt) {
    this.set("totalRewardsClaimed", Value.fromBigInt(value));
  }

  get campaigns(): UserCampaignLoader {
    return new UserCampaignLoader(
      "User",
      this.get("id")!
        .toBytes()
        .toHexString(),
      "campaigns"
    );
  }
}

export class UserCampaign extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save UserCampaign entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type UserCampaign must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("UserCampaign", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): UserCampaign | null {
    return changetype<UserCampaign | null>(
      store.get_in_block("UserCampaign", id.toHexString())
    );
  }

  static load(id: Bytes): UserCampaign | null {
    return changetype<UserCampaign | null>(
      store.get("UserCampaign", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get user(): Bytes {
    let value = this.get("user");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set user(value: Bytes) {
    this.set("user", Value.fromBytes(value));
  }

  get campaign(): Bytes {
    let value = this.get("campaign");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set campaign(value: Bytes) {
    this.set("campaign", Value.fromBytes(value));
  }
}

export class UserCampaignLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): UserCampaign[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<UserCampaign[]>(value);
  }
}

export class RewardLogLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): RewardLog[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<RewardLog[]>(value);
  }
}
