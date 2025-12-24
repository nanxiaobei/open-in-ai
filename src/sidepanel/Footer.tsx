import { Loading } from '@/components/Loading.tsx';
import { Tip } from '@/components/Tip.tsx';
import { BRAND_NAME, DATE_FORMAT, TRIAL_ENDED } from '@/config.ts';
import { useActivate } from '@/hooks/useActivate.ts';
import { useStore } from '@/store.ts';
import { cn } from '@/utils/cn.ts';
import { emit } from '@/utils/event.ts';
import dayjs from 'dayjs';

export const Footer = () => {
  const { state } = useStore();
  const { authKey, authData } = state;
  const { isPending, mutate } = useActivate();

  const freeTrial = authData?.trial;
  const authError = authData?.error;
  const authUser = authData?.meta?.customer_name;

  return (
    <>
      <div className="fixed inset-x-[5px] bottom-[5px] flex flex-col rounded-b-[11px] px-[calc(var(--px)-3px)] py-[calc(var(--py)-3px)] backdrop-blur-[24px] [&_.box]:justify-center [&_.screen]:min-h-[36px]!">
        {authData ? (
          <>
            {freeTrial || authError ? (
              <form
                className={cn(
                  'flex flex-col gap-[6px]',
                  isPending ? 'pointer-events-none opacity-70' : '',
                )}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.target as HTMLFormElement;
                  const license_key = form.license_key.value.trim();
                  mutate(license_key);
                }}
              >
                <h2>License</h2>
                <div className="box input">
                  <input
                    name="license_key"
                    placeholder="Enter License Key"
                    autoComplete="off"
                    required
                  />
                </div>
                <button className={cn('box primary gap-[8px]')}>
                  {isPending && (
                    <Loading className="static! [--bg:rgb(255_255_255/0.8)]!" />
                  )}
                  Submit
                </button>

                <div className="mt-[8px] text-[12px] text-black/50 [&_span]:text-black">
                  {freeTrial ? (
                    <>
                      Free trial until{' '}
                      <span>{dayjs(authKey).format(DATE_FORMAT)}</span>
                    </>
                  ) : authError === TRIAL_ENDED ? (
                    <>
                      Free trial has ended in{' '}
                      <span>{dayjs(authKey).format(DATE_FORMAT)}</span>
                    </>
                  ) : (
                    <>
                      {authError}{' '}
                      <a
                        href="https://app.lemonsqueezy.com/my-orders"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>
                          Check{' '}
                          <i className="inline-block translate-y-[-2px] text-[6px] not-italic">
                            ↗
                          </i>
                        </span>
                      </a>
                    </>
                  )}
                </div>

                <a
                  className="box secondary"
                  href={
                    process.env.NODE_ENV === 'development'
                      ? 'https://21beats.lemonsqueezy.com/checkout/buy/22380396-49fe-4f06-83ca-2786a02df3d7'
                      : 'https://21beats.lemonsqueezy.com/checkout/buy/6d4d7d4a-8c7e-4b5c-adce-71ba3bb9cffa'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get License Key <span className="text-[10px]">↗</span>
                </a>
              </form>
            ) : (
              <div className="box screen flat">
                <div className="truncate text-[12px] text-black/30">
                  Licensed to {authUser}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="box screen flat" />
        )}

        <div
          className={cn(
            'mt-[16px] flex items-center gap-[12px] text-[12px] text-(color:--brand-bg) [--brand-bg:#ccc]',
            'after:h-[16px] after:flex-1 after:[background:radial-gradient(var(--brand-bg)_1px,transparent_0)_3px_1px/4px_4px]',
          )}
          {...(process.env.NODE_ENV === 'development'
            ? {
                onClick: () => {
                  emit('bg', 'createTab', 'chrome://extensions/');
                },
              }
            : undefined)}
        >
          {BRAND_NAME} ™
        </div>
      </div>

      <Tip />
    </>
  );
};
