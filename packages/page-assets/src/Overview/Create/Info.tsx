// Copyright 2017-2025 @polkadot/app-assets authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BitLength } from '@polkadot/react-components/types';
import type { BN } from '@polkadot/util';
import type { InfoState } from './types.js';

import React, { useEffect, useMemo, useState } from 'react';

import { Input, InputAddress, InputBalance, InputNumber, Modal } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../../translate.js';

interface Props {
  assetIds: BN[];
  className?: string;
  defaultValue: InfoState | null;
  onChange: (info: InfoState | null) => void;
  openId: BN;
}

const ASSET_ID_BIT_LENGTH: BitLength = 128;

function Info ({ assetIds, className = '', defaultValue, onChange, openId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [initial] = useState(() => defaultValue);
  const [initialId] = useState(() => openId);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<BN | undefined>();
  const [assetDecimals, setAssetDecimals] = useState<BN | undefined>();
  const [assetName, setAssetName] = useState<string | null | undefined>(() => defaultValue?.assetName);
  const [assetSymbol, setAssetSymbol] = useState<string | null | undefined>(() => defaultValue?.assetSymbol);
  const [minBalance, setMinBalance] = useState<BN | undefined>();

  const [siDecimals, siSymbol] = useMemo(
    () => assetDecimals && assetSymbol
      ? [assetDecimals.toNumber(), assetSymbol.toUpperCase()]
      : [0, 'NONE'],
    [assetDecimals, assetSymbol]
  );

  const isValidDecimals = useMemo(
    () => !!assetDecimals && assetDecimals.lten(20),
    [assetDecimals]
  );

  const isValidName = useMemo(
    () => !!assetName && assetName.length >= 3 && assetName.length <= 32,
    [assetName]
  );

  const isValidSymbol = useMemo(
    () => !!assetSymbol && assetSymbol.length >= 3 && assetSymbol.length <= 7,
    [assetSymbol]
  );

  const isValidId = useMemo(
    () => !!assetId && assetId.gt(BN_ZERO) && !assetIds.some((a) => a.eq(assetId)),
    [assetId, assetIds]
  );

  useEffect((): void => {
    onChange(
      assetId && assetName && assetSymbol && assetDecimals && isValidId && isValidName && isValidSymbol && isValidDecimals && accountId && minBalance && !minBalance.isZero()
        ? { accountId, assetDecimals, assetId, assetName, assetSymbol, minBalance }
        : null
    );
  }, [api, accountId, assetDecimals, assetId, assetIds, assetName, assetSymbol, isValidId, isValidName, isValidSymbol, isValidDecimals, minBalance, onChange]);

  return (
    <Modal.Content className={className}>
      <Modal.Columns hint={t('The account that is to be used to create this asset and setup the initial metadata.')}>
        <InputAddress
          defaultValue={initial?.accountId}
          label={t('creator account')}
          onChange={setAccountId}
          type='account'
        />
      </Modal.Columns>
      <Modal.Columns hint={t('The descriptive name for this asset.')}>
        <Input
          autoFocus
          defaultValue={initial?.assetName}
          isError={!isValidName}
          label={t('asset name')}
          onChange={setAssetName}
        />
      </Modal.Columns>
      <Modal.Columns hint={t('The symbol that will represent this asset.')}>
        <Input
          defaultValue={initial?.assetSymbol}
          isError={!isValidSymbol}
          label={t('asset symbol')}
          onChange={setAssetSymbol}
        />
      </Modal.Columns>
      <Modal.Columns hint={t('The number of decimals for this token. Max allowed via the UI is set to 20.')}>
        <InputNumber
          defaultValue={initial?.assetDecimals}
          isError={!isValidDecimals}
          label={t('asset decimals')}
          onChange={setAssetDecimals}
        />
      </Modal.Columns>
      <Modal.Columns hint={t('The minimum balance for the asset. This is specified in the units and decimals as requested.')}>
        <InputBalance
          defaultValue={initial?.minBalance}
          isZeroable={false}
          label={t('minimum balance')}
          onChange={setMinBalance}
          siDecimals={siDecimals}
          siSymbol={siSymbol}
        />
      </Modal.Columns>
      <Modal.Columns hint={t('The selected id for the asset. This should not match an already-existing asset id.')}>
        <InputNumber
          bitLength={ASSET_ID_BIT_LENGTH}
          defaultValue={initial?.assetId || initialId}
          isError={!isValidId}
          isZeroable={false}
          label={t('asset id')}
          onChange={setAssetId}
        />
      </Modal.Columns>
    </Modal.Content>
  );
}

export default React.memo(Info);
