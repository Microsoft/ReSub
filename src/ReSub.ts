/**
* ReSub.ts
* Author: David de Regt
* Copyright: Microsoft 2016
*
* Shared basic types for ReSub.
*/

import ComponentBaseI = require('./ComponentBase');
import withStoreSubscriptionI = require('./withStoreSubscription');
import AutoSubscriptionsI = require('./AutoSubscriptions');
import StoreBaseI = require('./StoreBase');
import TypesI = require('./Types');
import OptionsI = require('./Options');

export const ComponentBase = ComponentBaseI.ComponentBase;
export const withStoreSubscription = withStoreSubscriptionI.withStoreSubscription;

export const StoreBase = StoreBaseI.StoreBase;

export const AutoSubscribeStore = AutoSubscriptionsI.AutoSubscribeStore;
export const autoSubscribe = AutoSubscriptionsI.autoSubscribe;
export const autoSubscribeWithKey = AutoSubscriptionsI.autoSubscribeWithKey;
export const key = AutoSubscriptionsI.key;
export const disableWarnings = AutoSubscriptionsI.disableWarnings;

export const Options = OptionsI.default;

export import Types = TypesI;
