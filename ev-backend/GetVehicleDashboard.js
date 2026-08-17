const { app } = require('@azure/functions');
const { Connection, Request } = require('tedious');

function parseSqlConnectionString(connStr) {
    const result = {};

    connStr.split(';').forEach(part => {
        const [key, ...valueParts] = part.split('=');
        if (!key || valueParts.length === 0) return;
        result[key.trim().toLowerCase()] = valueParts.join('=').trim();
    });

    return result;
}

app.http('GetVehicleDashboard', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',

    handler: async (request, context) => {
        context.log('GetVehicleDashboard API 실행');

        if (request.method === 'OPTIONS') {
            return {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            };
        }

        const sqlConnectionString = process.env.SqlConnectionString;

        if (!sqlConnectionString) {
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing SqlConnectionString',
                    message: 'local.settings.json에 SqlConnectionString이 없습니다.'
                })
            };
        }

        const sqlConn = parseSqlConnectionString(sqlConnectionString);

        const server = (sqlConn['server'] || '')
            .replace('tcp:', '')
            .split(',')[0];

        const database = sqlConn['database'] || sqlConn['initial catalog'];
        const userName = sqlConn['uid'] || sqlConn['user id'];
        const password = sqlConn['pwd'] || sqlConn['password'];

        if (!server || !database || !userName || !password) {
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Invalid SqlConnectionString',
                    server: server,
                    database: database,
                    hasUserName: !!userName,
                    hasPassword: !!password
                })
            };
        }

        const config = {
            server: server,
            authentication: {
                type: 'default',
                options: {
                    userName: userName,
                    password: password
                }
            },
            options: {
                database: database,
                encrypt: true,
                trustServerCertificate: false,
                rowCollectionOnRequestCompletion: true
            }
        };

        // 🌟 [수정 완료] 과거 데이터가 누적되어 카운트가 늘어나는 현상을 막기 위해,
        // 서브쿼리를 이용해 가장 최근(received_at DESC)에 적재된 상위 100대의 활성 차량만 딱 잘라서 가져옵니다.
        const query = `
            WITH RecentActiveVehicles AS (
                SELECT TOP 100 
                    vehicle_id,
                    latitude,
                    longitude,
                    current_bsi,
                    status,
                    alert_type,
                    received_at
                FROM evpulse.Vehicle_Current_Status
                WHERE is_active = 1
                ORDER BY received_at DESC
            )
            SELECT
                rav.vehicle_id,
                rav.latitude,
                rav.longitude,
                rav.current_bsi,
                rav.status,
                rav.alert_type,
                rav.received_at,
                ISNULL(CONVERT(NVARCHAR(100), bt.model_name), N'모델 미확인') AS model_name,
                ISNULL(CONVERT(NVARCHAR(100), bt.region_name), N'지역 미확인') AS region_name,
                ISNULL(bt.battery_current, 0) AS battery_current,
                ISNULL(bt.delta_i, 0) AS delta_i,
                ISNULL(bt.delta_v, 0) AS delta_v,
                ISNULL(bt.temperature, 0) AS temperature,
                ISNULL(bt.joule_heating_stress, 0) AS joule_heating_stress
            FROM RecentActiveVehicles rav
            OUTER APPLY (
                SELECT TOP 1
                    model_name,
                    region_name,
                    battery_current,
                    delta_i,
                    delta_v,
                    temperature,
                    joule_heating_stress
                FROM evpulse.Battery_Telemetry
                WHERE vehicle_id = rav.vehicle_id
                ORDER BY received_at DESC
            ) bt
            ORDER BY rav.received_at DESC;
        `;

        return await new Promise((resolve) => {
            const connection = new Connection(config);

            connection.on('connect', (err) => {
                if (err) {
                    context.log(`DB 연결 실패: ${err.message}`);

                    resolve({
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        body: JSON.stringify({
                            error: 'DB Connection Error',
                            message: err.message
                        })
                    });

                    return;
                }

                const sqlRequest = new Request(query, (err, rowCount, rows) => {
                    if (err) {
                        context.log(`쿼리 실행 실패: ${err.message}`);

                        resolve({
                            status: 500,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            body: JSON.stringify({
                                error: 'Query Execution Error',
                                message: err.message
                            })
                        });
                    } else {
                        const vehicles = rows.map(row => {
                            const vehicle = {};
                            row.forEach(cell => {
                                const propName = String(cell.metadata.colName).toLowerCase();
                                vehicle[propName] = cell.value;
                            });
                            return vehicle;
                        });

                        context.log(`조회된 차량 수: ${vehicles.length}`);

                        resolve({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                                'Cache-Control': 'no-store'
                            },
                            body: JSON.stringify({
                                vehicles: vehicles
                            })
                        });
                    }

                    connection.close();
                });

                connection.execSql(sqlRequest);
            });

            connection.connect();
        });
    }
});