const { app } = require('@azure/functions');
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions
} = require('@azure/storage-blob');

app.http('GetReportList', {
    methods: ['GET'],
    authLevel: 'anonymous',

    handler: async (request, context) => {
        try {
            const connStr =
                process.env.BLOB_CONNECTION_STRING ||
                process.env.AzureWebJobsStorage;

            if (!connStr) {
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify([])
                };
            }

            const blobServiceClient =
                BlobServiceClient.fromConnectionString(connStr);

            const containerName = 'ev-reports';
            const containerClient =
                blobServiceClient.getContainerClient(containerName);

            const accountName = connStr.match(/AccountName=([^;]+)/)?.[1];
            const accountKey = connStr.match(/AccountKey=([^;]+)/)?.[1];

            if (!accountName || !accountKey) {
                return {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        error: 'Storage AccountName 또는 AccountKey를 연결 문자열에서 찾을 수 없습니다.'
                    })
                };
            }

            const sharedKeyCredential = new StorageSharedKeyCredential(
                accountName,
                accountKey
            );

            const reportsList = [];

            const twentyFourHoursAgo = new Date(
                Date.now() - 24 * 60 * 60 * 1000
            );

            if (await containerClient.exists()) {
                for await (const blob of containerClient.listBlobsFlat()) {
                    const blobCreatedDate = new Date(blob.properties.createdOn);

                    let reportType = null;
                    let fileName = null;

                    if (blob.name.startsWith('daily/')) {
                        if (blobCreatedDate < twentyFourHoursAgo) {
                            continue;
                        }

                        reportType = '📊 정기 일일 요약 보고서';
                        fileName = blob.name.replace('daily/', '');
                    } else if (blob.name.startsWith('anomaly/')) {
                        reportType = '⚠️ 배터리 이상 탐지 보고서';
                        fileName = blob.name.replace('anomaly/', '');
                    } else {
                        continue;
                    }

                    const sasToken = generateBlobSASQueryParameters(
                        {
                            containerName: containerName,
                            blobName: blob.name,
                            permissions: BlobSASPermissions.parse('r'),
                            startsOn: new Date(Date.now() - 5 * 60 * 1000),
                            expiresOn: new Date(Date.now() + 60 * 60 * 1000)
                        },
                        sharedKeyCredential
                    ).toString();

                    const blobClient =
                        containerClient.getBlockBlobClient(blob.name);

                    const downloadUrl = `${blobClient.url}?${sasToken}`;

                    reportsList.push({
                        fileName: fileName,
                        type: reportType,
                        createdOn: blob.properties.createdOn,
                        downloadUrl: downloadUrl
                    });
                }
            }

            reportsList.sort(
                (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
            );

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify(reportsList)
            };

        } catch (error) {
            context.log('GetReportList 오류:', error.message);

            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: '스토리지 목록 동기화 실패',
                    details: error.message
                })
            };
        }
    }
});