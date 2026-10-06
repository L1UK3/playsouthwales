/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { Crown } from 'lucide-react';

type PodiumSize = 'sm' | 'default' | 'lg';

function classNames(...values: (string | false | null | undefined)[]) {
    return values.filter(Boolean).join(' ');
}

// Types (inlined)
interface LeaderboardRanking {
    userId: string;
    userName: string | null;
    rank: number;
    value: number;
    avatarUrl?: string | null;
}

const podiumVariants = ({ size = 'default' }: { size?: PodiumSize } = {}) =>
    classNames(
        'flex items-end justify-center',
        size === 'sm' ? 'gap-2' : size === 'lg' ? 'gap-6' : 'gap-4'
    );

// Podium styles for each position
const PODIUM_CONFIG = {
    1: {
        icon: Crown,
        color: 'text-rank-1',
        bg: 'bg-rank-1/60',
        height: 'h-32',
        heightSm: 'h-24',
        heightLg: 'h-40',
    },
    2: {
        icon: Crown,
        color: 'text-rank-2',
        bg: 'bg-rank-2/30',
        height: 'h-24',
        heightSm: 'h-20',
        heightLg: 'h-32',
    },
    3: {
        icon: Crown,
        color: 'text-rank-3',
        bg: 'bg-rank-3/50',
        height: 'h-20',
        heightSm: 'h-16',
        heightLg: 'h-28',
    },
} as const;

// Props
interface LeaderboardPodiumProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: PodiumSize;
    /** Top 3 rankings (expects at least 1, ideally 3) */
    rankings: LeaderboardRanking[];
    /** Show value below name */
    showValue?: boolean;
    /** Show avatar */
    showAvatar?: boolean;
    /** Crown badge style variant */
    medalStyle?: 'classic' | 'modern' | 'minimal';
}

const LeaderboardPodium = ({
    className,
    size,
    rankings,
    showValue = true,
    showAvatar = true,
    medalStyle = 'classic',
    ...props
}: LeaderboardPodiumProps) => {
    const podiumOrder = [2, 1, 3]
        .map((rank) => rankings.find((ranking) => ranking.rank === rank))
        .filter(
            (ranking): ranking is LeaderboardRanking => ranking !== undefined
        );

    if (podiumOrder.length === 0) {
        return null;
    }

    const avatarSize = {
        sm: 'h-10 w-10 text-sm',
        default: 'h-14 w-14 text-lg',
        lg: 'h-20 w-20 text-2xl',
    }[size ?? 'default'];

    const iconSize = {
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
    }[size ?? 'default'];

    const textSize = {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
    }[size ?? 'default'];

    return (
        <div
            className={classNames(podiumVariants({ size }), className)}
            role="list"
            aria-label="Top 3 rankings"
            {...props}
        >
            {podiumOrder.map((ranking) => {
                const config = PODIUM_CONFIG[ranking.rank as 1 | 2 | 3];
                if (!config) return null;

                const displayName =
                    ranking.userName ?? `User ${ranking.userId.slice(0, 6)}`;
                const podiumHeight = {
                    sm: config.heightSm,
                    default: config.height,
                    lg: config.heightLg,
                }[size ?? 'default'];

                const itemLabel = `Rank ${ranking.rank}: ${displayName}${showValue ? `, ${ranking.value.toLocaleString()}` : ''}`;

                return (
                    <div
                        key={ranking.userId}
                        role="listitem"
                        aria-label={itemLabel}
                        className="flex flex-col items-center"
                    >
                        {/* Avatar with crown */}
                        <div className="relative mb-2" aria-hidden="true">
                            {showAvatar && ranking.avatarUrl ? (
                                <img
                                    src={ranking.avatarUrl}
                                    alt=""
                                    className={classNames(
                                        'rounded-full object-cover',
                                        avatarSize
                                    )}
                                />
                            ) : (
                                <div
                                    className={classNames(
                                        'flex items-center justify-center rounded-full',
                                        avatarSize,
                                        config.bg
                                    )}
                                >
                                    <config.icon
                                        className={classNames(
                                            iconSize,
                                            config.color
                                        )}
                                    />
                                </div>
                            )}

                            {/* Crown badge */}
                            {medalStyle !== 'minimal' && (
                                <div
                                    className={classNames(
                                        'bg-background absolute -right-1 -bottom-1 flex items-center justify-center rounded-full shadow-sm',
                                        size === 'sm'
                                            ? 'h-5 w-5'
                                            : size === 'lg'
                                              ? 'h-8 w-8'
                                              : 'h-6 w-6'
                                    )}
                                >
                                    <config.icon
                                        className={classNames(
                                            config.color,
                                            size === 'sm'
                                                ? 'h-3 w-3'
                                                : size === 'lg'
                                                  ? 'h-5 w-5'
                                                  : 'h-4 w-4'
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <span
                            className={classNames(
                                'max-w-20 truncate text-center font-medium',
                                textSize
                            )}
                            title={displayName}
                        >
                            {displayName}
                        </span>

                        {/* Value */}
                        {showValue && (
                            <span
                                className={classNames(
                                    'text-muted-foreground tabular-nums',
                                    size === 'sm' ? 'text-xs' : 'text-sm'
                                )}
                            >
                                {ranking.value.toLocaleString()}
                            </span>
                        )}

                        {/* Podium block */}
                        <div
                            aria-hidden="true"
                            className={classNames(
                                'mt-2 w-22 rounded-t-lg',
                                size === 'sm' && 'w-20',
                                size === 'lg' && 'w-24',
                                podiumHeight,
                                config.bg,
                                medalStyle === 'modern' && 'rounded-t-xl'
                            )}
                        >
                            <div
                                className={classNames(
                                    'flex h-8 items-center justify-center font-bold',
                                    config.color
                                )}
                            >
                                {ranking.rank}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export { LeaderboardPodium, podiumVariants };
export type { LeaderboardPodiumProps, LeaderboardRanking };
