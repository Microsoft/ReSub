import { StoreBase } from '../src/StoreBase';
import { isEqual, uniq } from 'lodash';
import {
    warnIfAutoSubscribeEnabled,
    autoSubscribeWithKey,
    AutoSubscribeStore,
    disableWarnings,
    autoSubscribe,
    key,
} from '../src/AutoSubscriptions';
import { assert } from '../src/utils';

export const enum TriggerKeys {
    First,
    Second
}

export type StoreData = number;

// Needs class decorator to support auto-subscriptions.
@AutoSubscribeStore
export class SimpleStore extends StoreBase {
    private _storeDataById: { [id: string]: StoreData } = {};
    private _subscribeWithKeyData = {
        A: 0,
        B: 0
    };

    private _subscribeWithEnumKeyData = {
        [TriggerKeys.First]: 0,
        [TriggerKeys.Second]: 0
    };

    // Auto-subscribes to Key_All (by default) since any change will affect the returned data.
    // Note: using the dangerous*Mutable convention since the returned data is not a copy.
    @autoSubscribe
    dangerousGetAllStoreDataMutable() {
        return this._storeDataById;
    }

    // Auto-subscribes to the key given by 'id' (note: @key decorator on 'id') since only changes on that 'id' affects
    // the returned data.
    @autoSubscribe
    getStoreData(@key id: string) {
        return this._get(id);
    }

    @autoSubscribeWithKey('A')
    getDataSingleKeyed(): number {
        return this._subscribeWithKeyData.A;
    }

    @autoSubscribeWithKey(['A', 'B'])
    getDataMultiKeyed(): number {
        return this._subscribeWithKeyData.A + this._subscribeWithKeyData.B;
    }

    @autoSubscribeWithKey(TriggerKeys.First)
    getDataSingleEnumKeyed(): number {
        return this._subscribeWithEnumKeyData[TriggerKeys.First];
    }

    @autoSubscribeWithKey([TriggerKeys.First, TriggerKeys.Second])
    getDataMultiEnumKeyed(): number {
        return this._subscribeWithEnumKeyData[TriggerKeys.First] + this._subscribeWithEnumKeyData[TriggerKeys.Second];
    }

    setStoreDataForKeyedSubscription(key: 'A'|'B', data: number): void {
        this._subscribeWithKeyData[key] = data;
        this.trigger(key);
    }

    setStoreDataForEnumKeyedSubscription(key: TriggerKeys, data: number): void {
        this._subscribeWithEnumKeyData[key] = data;
        this.trigger(key);
    }

    // Setters should not be called when auto-subscribe is enabled.
    // Note: @warnIfAutoSubscribeEnabled is automatically added (in debug mode) to any method missing @autoSubscribe
    // or @disableWarnings. That will catch the case where setters are called in a _buildState.
    clearStoreData() {
        this._storeDataById = {};
    }

    // Note: explicitly adding decorator so the tests always works, even outside of debug mode. This is not necessary
    // in real stores, as explained above clearStoreData.
    @warnIfAutoSubscribeEnabled
    setStoreData(id: string, storeData: StoreData) {
        const old = this._storeDataById[id];
        this._storeDataById[id] = storeData;

        if (!isEqual(old, storeData)) {
            this.trigger(id);
        }
    }

    // Internal methods to StoreBase are safe to call regardless of auto-subscribe, so disable any warnings.
    @disableWarnings
    protected _getSubscriptionKeys() {
        const keys = super._getSubscriptionKeys();
        assert(isEqual(keys, uniq(keys)), 'Internal failure: StoreBase should not report duplicate keys');
        return keys;
    }

    // No need to decorate private methods with @autoSubscribe or @disableWarnings. If auto-subscriptions are enabled
    // (e.g. from the _buildState of some component) then we can only reach here by being called from other public
    // methods (e.g. getStoreData), or protected methods on StoreBase. Thus only public/protected methods need the
    // appropriate decorator.
    // Note: @warnIfAutoSubscribeEnabled is automatically added (in debug mode) to this method, but that decorator does
    // nothing if another decorated method is calling this one (e.g. getStoreData).
    private _get(id: string) {
        return this._storeDataById[id];
    }

    // Note: using test_* convention since it is only used for testing and breaks good practice otherwise.
    test_getSubscriptionKeys() {
        return this._getSubscriptionKeys();
    }

    test_getSubscriptions() {
        // Access private internal state of store
        return (this as any)._subscriptions;
    }

    test_getAutoSubscriptions() {
        // Access private internal state of store
        return (this as any)._autoSubscriptions;
    }
}
