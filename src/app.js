import React, { useMemo } from 'react'
import { Bar } from '@visx/shape'
import { Group } from '@visx/group'
import { GradientPinkBlue } from '@visx/gradient'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis';


import { gql, useQuery } from '@apollo/client'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'


const monthsFormat = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];



const api_url = "https://fakerql.stephix.uk/graphql"

const client = new ApolloClient({
    uri: api_url,
    cache: new InMemoryCache()
});


const GET_POSTS = gql`query Posts($count: Int!) {
    allPosts(count: $count) {
        createdAt
    }
}`;


const verticalMargin = 100;
const horizontalMargin = 100;


const Hist = ({width=1600, height=500, events=false}) => {

    const xMax = width - horizontalMargin;
    const yMax = height - verticalMargin;

    const { data } = useQuery(GET_POSTS, {
        variables: {count: 1000}
    });

    const months = useMemo(() => {

        let obj = {
            0: 0,
            1: 1,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
        }

        if (data) {
            data.allPosts.filter(
                elm => elm
            ).forEach(elm => { obj[(new Date(Number(elm.createdAt))).getUTCMonth()]++ })
        }

        return obj

    }, [data])

    const xScale = useMemo(() => scaleBand({
        range: [0, xMax],
        domain: Object.keys(months),
        padding: 0.4,

    }), [xMax, months])

    const yScale = useMemo(() => scaleLinear({
        range: [yMax, 0],
        domain: [0, Math.max(...Object.values(months))],

    }), [yMax, months])

    return width < 10 ? null : (
        <svg width={width} height={height} id="hist">
            <GradientPinkBlue id="pink" />
            <rect width={width} height={height} fill="url(#pink)" />
            <Group top={verticalMargin / 2} left={horizontalMargin/2}>
                <AxisLeft scale={yScale} />
                {Object.keys(months).map(month => {

                    const letter = month;
                    const barWidth = xScale.bandwidth();
                    const barHeight = yMax - (yScale(months[month]) ?? 0);
                    const barX = xScale(letter);
                    const barY = yMax - barHeight;

                    return (
                        <Bar
                            className="bar"
                            key={`bar-${letter}`}
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={barHeight}
                            fill="rgba(23, 233, 217, .5)"
                            rx={14}
                        />
                    );
                })}
            </Group>
            <AxisBottom
                top={yMax + verticalMargin / 2 + 5}
                tickFormat={(month) => monthsFormat[month]}
                left={horizontalMargin/2}
                scale={xScale}
                stroke={"#ffefff"}
                tickStroke={"#ffefff"}
                tickLabelProps={() => ({
                    fill: "#ffefff",
                    fontSize: 11,
                    textAnchor: 'middle',
                })}
            />
        </svg>
    );
}


const App = () => {
    return (
        <ApolloProvider client={client}>
            <Hist />
        </ApolloProvider>
    )
}



export default App;