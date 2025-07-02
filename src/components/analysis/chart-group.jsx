import {
    PieChart,
    TreemapChart,
    WordCloudChart,
    ColumnChart,
    GaugeChart,
    LiquidChart
} from '@opd/g2plot-react';
import { ExpandableCard } from '@/components/ui/expandable-card';

const appColors = {
    primary: '#0f172a',
    primaryLight: '#1e293b',
    secondary: '#06b6d4',
    secondaryLight: '#67e8f9',

    positive: '#99f6e4',
    negative: '#fecdd3',
    neutral: '#bae6fd',

    navyGradient: ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
    cyanGradient: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'],


    emotion: {
        anger: '#fecdd3',
        disgust: '#d8b4fe',
        fear: '#fef08a',
        joy: '#99f6e4',
        sadness: '#bae6fd',
        surprise: '#c4b5fd'
    }
};

const AnalysisResult = ({ data }) => {
    if (!data || typeof data !== 'object') {
        return (
            <div className="py-6 max-w-6xl mx-auto">
                <div className="text-center text-red-600">
                    <p>Error: Invalid analysis data received</p>
                </div>
            </div>
        );
    }

    const sentimentData = data['Sentiment Analysis'] || { positive: 0, negative: 0, neutral: 1 };
    const topicData = data['Topic Detection'] || [];
    const emotionData = data['Emotion Analysis'] || { anger: 0, disgust: 0, fear: 0, joy: 0.5, sadness: 0, surprise: 0 };
    const aspectData = data['Aspect-Based Sentiment Analysis'] || [];
    const keyphraseData = data['Keyphrase Extraction'] || [];
    const entityData = data['Entity Extraction'] || [];
    const relevanceScore = data['Relevance Score'] || 0;

    const sentimentConfig = {
        data: [
            { type: 'Positive', value: sentimentData.positive || 0 },
            { type: 'Negative', value: sentimentData.negative || 0 },
            { type: 'Neutral', value: sentimentData.neutral || 0 },
        ].filter(item => item.value > 0),
        angleField: 'value',
        colorField: 'type',
        color: [appColors.positive, appColors.negative, appColors.neutral],
        radius: 0.8,
        innerRadius: 0.6,
        label: {
            type: 'inner',
            offset: '-50%',
            content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            style: {
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 'bold',
                fill: appColors.primary,
            },
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
        legend: {
            position: 'bottom',
        },
        statistic: {
            title: false,
            content: {
                style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 16,
                    fontWeight: 'bold',
                    fill: appColors.primary,
                },
                content: 'Sentiment',
            },
        },
        height: 300,
    };

    const topicConfig = {
        data: {
            name: 'root',
            children: topicData.length > 0 ? topicData.map(topic => ({
                name: topic.name || 'Unknown',
                value: (topic.value || 0) * 100,
            })) : [{ name: 'No topics detected', value: 100 }],
        },
        colorField: 'value',
        color: appColors.navyGradient,
        interactions: [{ type: 'view-zoom' }, { type: 'drag-move' }],
        tooltip: {
            formatter: (v) => ({
                name: v.name,
                value: (v.value / 100).toFixed(2),
            }),
        },
        height: 300,
    };

    const emotionConfig = {
        data: Object.entries(emotionData).map(([emotion, value]) => ({
            emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
            value: value || 0,
        })).filter(item => item.value > 0),
        angleField: 'value',
        colorField: 'emotion',
        color: ({ emotion }) => {
            return appColors.emotion[emotion.toLowerCase()] || appColors.neutral;
        },
        radius: 0.8,
        innerRadius: 0.5,
        label: {
            type: 'outer',
            content: ({ percent, emotion }) => `${emotion}: ${(percent * 100).toFixed(0)}%`,
            style: {
                fill: appColors.primary,
            },
        },
        legend: {
            position: 'bottom',
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
        height: 300,
    };


    const aspectConfigAlt = {
        data: aspectData.length > 0 ?
            aspectData.flatMap(aspect => {
                const value = aspect.sentiment === 'positive' ? 0.7 :
                    aspect.sentiment === 'negative' ? 0.7 : 0.3;
                return [{
                    aspect: aspect.aspect || 'Unknown',
                    value: value,
                    type: aspect.sentiment || 'neutral',
                    positive: aspect.sentiment === 'positive' ? value : 0,
                    negative: aspect.sentiment === 'negative' ? value : 0,
                    neutral: aspect.sentiment === 'neutral' ? value : 0,
                }];
            })
            : [{ aspect: 'No aspects detected', value: 0, type: 'neutral', positive: 0, negative: 0, neutral: 0.3 }],
        xField: 'aspect',
        yField: 'value',
        seriesField: 'type',
        isStack: false,
        isGroup: true,
        color: ({ type }) => {
            if (type === 'positive') return appColors.positive;
            if (type === 'negative') return appColors.negative;
            return appColors.neutral;
        },
        label: {
            position: 'top',
            style: {
                fill: appColors.primary,
            },
        },
        height: 300,
    };

    const wordCloudConfig = {
        data: keyphraseData.length > 0 ? keyphraseData : [{ name: 'No keyphrases', value: 1 }],
        wordField: 'name',
        weightField: 'value',
        colorField: 'name',
        wordStyle: {
            fontFamily: 'Arial',
            fontSize: [16, 48],
            rotation: [0, 0],
            padding: 5,
        },
        random: () => 0.5,
        height: 300,
        color: appColors.cyanGradient,
        tooltip: {
            formatter: (datum) => {
                return { name: datum.name, value: datum.value.toFixed(2) };
            },
        },
    };

    const entityTypes = [...new Set(entityData.map(item => item.entity))];
    const entityDataForChart = entityTypes.map(type => {
        return {
            type,
            count: entityData.filter(item => item.entity === type).length
        };
    }).sort((a, b) => b.count - a.count);

    const entityConfig = {
        data: entityDataForChart.length > 0 ? entityDataForChart : [{ type: 'No entities', count: 0 }],
        xField: 'type',
        yField: 'count',
        seriesField: 'type',
        color: appColors.cyanGradient,
        columnWidthRatio: 0.6,
        label: {
            position: 'top',
            style: {
                fill: appColors.primary,
            },
        },
        height: 300,
    };

    const relevanceConfig = {
        percent: relevanceScore,
        range: {
            color: [appColors.negative, appColors.neutral, appColors.positive],
            ticks: [0, 0.3, 0.7, 1],
        },
        indicator: {
            pointer: {
                style: {
                    stroke: appColors.primaryLight,
                },
            },
            pin: {
                style: {
                    stroke: appColors.primaryLight,
                },
            },
        },
        axis: {
            label: {
                formatter(v) {
                    return Number(v) * 100;
                },
                style: {
                    fill: appColors.primary,
                },
            },
            subTickLine: {
                count: 3,
                style: {
                    stroke: appColors.primaryLight,
                }
            },
        },
        statistic: {
            title: {
                formatter: () => 'Relevance',
                style: {
                    fontSize: '16px',
                    fill: appColors.primary,
                },
            },
            content: {
                formatter: () => `${(relevanceScore * 100).toFixed(0)}%`,
                style: {
                    fontSize: '24px',
                    fill: appColors.secondary,
                    fontWeight: 'bold',
                },
                offsetY: -14,
            },
        },
        height: 300,
    };

    const dominantSentiment = Object.entries(sentimentData)
        .filter(([key]) => ['positive', 'negative', 'neutral'].includes(key))
        .sort(([, a], [, b]) => b - a)[0] || ['neutral', 0];

    const [sentimentType, sentimentValue] = dominantSentiment;


    const getSentimentColor = (type) => {
        if (type === 'positive') return appColors.positive;
        if (type === 'negative') return appColors.negative;
        return appColors.neutral;
    };


    const sentimentLiquidConfig = {
        percent: sentimentValue,
        outline: {
            border: 2,
            distance: 4,
            style: {
                stroke: getSentimentColor(sentimentType),
                strokeOpacity: 0.65,
            },
        },
        wave: {
            length: 128,
        },
        liquidStyle: {
            fill: getSentimentColor(sentimentType),
            fillOpacity: 0.6,
        },
        statistic: {
            title: {
                formatter: () => sentimentType.charAt(0).toUpperCase() + sentimentType.slice(1),
                style: {
                    fontSize: '16px',
                    fill: appColors.primary,
                },
            },
            content: {
                formatter: () => `${(sentimentValue * 100).toFixed(0)}%`,
                style: {
                    fontSize: '24px',
                    fill: '#000000',
                    fontWeight: 'bold',
                },
            },
        },
        height: 300,
    };

    return (
        <div className="py-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sentimentConfig.data.length > 0 && (
                    <ExpandableCard
                        title="Sentiment Analysis"
                        content={<PieChart {...sentimentConfig} />}
                        expandedContent={
                            <div className="h-[600px]">
                                <PieChart {...sentimentConfig} height={600} />
                            </div>
                        }
                    />
                )}

                {emotionConfig.data.length > 0 && (
                    <ExpandableCard
                        title="Emotion Analysis"
                        content={<PieChart {...emotionConfig} />}
                        expandedContent={
                            <div className="h-[600px]">
                                <PieChart {...emotionConfig} height={600} />
                            </div>
                        }
                    />
                )}

                <ExpandableCard
                    title="Topic Detection"
                    content={<TreemapChart {...topicConfig} />}
                    expandedContent={
                        <div className="h-[600px]">
                            <TreemapChart {...topicConfig} height={600} />
                        </div>
                    }
                    fullWidth
                />

                {aspectData.length > 0 && aspectData[0].aspect !== 'No aspects detected' && (
                    <ExpandableCard
                        title="Aspect-Based Sentiment Analysis"
                        content={<ColumnChart {...aspectConfigAlt} />}
                        expandedContent={
                            <div className="h-[600px]">
                                <ColumnChart {...aspectConfigAlt} height={600} />
                            </div>
                        }
                    />
                )}

                <ExpandableCard
                    title="Dominant Sentiment"
                    content={<LiquidChart {...sentimentLiquidConfig} />}
                    expandedContent={
                        <div className="h-[600px]">
                            <LiquidChart {...sentimentLiquidConfig} height={600} />
                        </div>
                    }
                />

                {keyphraseData.length > 0 && (
                    <ExpandableCard
                        title="Keyphrase Extraction"
                        content={<WordCloudChart {...wordCloudConfig} />}
                        expandedContent={
                            <div className="h-[600px]">
                                <WordCloudChart {...wordCloudConfig} height={600} />
                            </div>
                        }
                        fullWidth
                    />
                )}

                {entityDataForChart.length > 0 && entityDataForChart[0].type !== 'No entities' && (
                    <ExpandableCard
                        title="Entity Types"
                        content={<ColumnChart {...entityConfig} />}
                        expandedContent={
                            <div className="h-[600px]">
                                <ColumnChart {...entityConfig} height={600} />
                            </div>
                        }
                    />
                )}

                <ExpandableCard
                    title="Relevance Score"
                    content={<GaugeChart {...relevanceConfig} />}
                    expandedContent={
                        <div className="h-[600px]">
                            <GaugeChart {...relevanceConfig} height={600} />
                        </div>
                    }
                />

                {/* Text Cards with safe access */}
                <ExpandableCard
                    title="Summary"
                    content={
                        <p className="text-gray-700 line-clamp-3">
                            {data['Summary Generation'] || 'No summary available'}
                        </p>
                    }
                    expandedContent={
                        <p className="text-gray-700">
                            {data['Summary Generation'] || 'No summary available'}
                        </p>
                    }
                    fullWidth
                />

                <ExpandableCard
                    title="Bias Detection"
                    content={
                        <p className="text-gray-700 line-clamp-3">
                            {data['Bias Detection'] || 'No bias detected'}
                        </p>
                    }
                    expandedContent={
                        <p className="text-gray-700">
                            {data['Bias Detection'] || 'No bias detected'}
                        </p>
                    }
                />

                <ExpandableCard
                    title="Stance Detection"
                    content={
                        <p className="text-gray-700 line-clamp-3">
                            {data['Stance Detection'] || 'No stance detected'}
                        </p>
                    }
                    expandedContent={
                        <p className="text-gray-700">
                            {data['Stance Detection'] || 'No stance detected'}
                        </p>
                    }
                />

                <ExpandableCard
                    title="Language Style"
                    content={
                        <p className="text-gray-700 line-clamp-3">
                            {data['Language Style Analysis'] || 'No style analysis available'}
                        </p>
                    }
                    expandedContent={
                        <p className="text-gray-700">
                            {data['Language Style Analysis'] || 'No style analysis available'}
                        </p>
                    }
                />

                <ExpandableCard
                    title="Category & Complexity"
                    content={
                        <div className="space-y-2 line-clamp-3">
                            <p><span className="font-medium">Category:</span> {data['Category Classification'] || 'Uncategorized'}</p>
                            <p><span className="font-medium">Reading Complexity:</span> {data['Reading Complexity'] || 'Unknown'}</p>
                        </div>
                    }
                    expandedContent={
                        <div className="space-y-2">
                            <p><span className="font-medium">Category:</span> {data['Category Classification'] || 'Uncategorized'}</p>
                            <p><span className="font-medium">Reading Complexity:</span> {data['Reading Complexity'] || 'Unknown'}</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default AnalysisResult;