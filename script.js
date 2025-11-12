const metrics = [
    { key: 'method', label: 'Method', sortable: false },
    { key: 't0', label: 'T0 (P1)', sortable: true },
    { key: 'recall', label: 'Recall (P2)', sortable: true },
    { key: 'latency', label: 'Latency (P2)', sortable: true },
    { key: 'qps', label: 'QPS (P3)', sortable: true },
    { key: 't1', label: 'T1 (P4)', sortable: true },
    { key: 't2', label: 'T2 (P5)', sortable: true },
    { key: 't3', label: 'T3 (P6)', sortable: true },
    { key: 'vrank', label: 'Vrank', sortable: true }
];

const leaderboardData = [
    {
        method: 'Milvus-HNSW',
        metrics: {
            t0: { value: 229.99, rank: 1 },
            recall: { value: 0.993, rank: 2 },
            latency: { value: 0.0586, rank: 5 },
            qps: { value: 19.41, rank: 6 },
            t1: { value: 146.29, rank: 1 },
            t2: { value: 168.51, rank: 1 },
            t3: { value: 7.75, rank: 2 },
            vrank: { value: 18, rank: 1 }
        }
    },
    {
        method: 'Pgvector-IVFFLAT',
        metrics: {
            t0: { value: 562.10, rank: 2 },
            recall: { value: 0.960, rank: 4 },
            latency: { value: 0.0828, rank: 6 },
            qps: { value: 101.83, rank: 2 },
            t1: { value: 495.09, rank: 3 },
            t2: { value: 471.53, rank: 3 },
            t3: { value: 7.00, rank: 1 },
            vrank: { value: 21, rank: 2 }
        }
    },
    {
        method: 'Milvus-IVFFLAT',
        metrics: {
            t0: { value: 1497.84, rank: 3 },
            recall: { value: 0.970, rank: 3 },
            latency: { value: 0.0327, rank: 4 },
            qps: { value: 21.26, rank: 5 },
            t1: { value: 298.00, rank: 2 },
            t2: { value: 179.40, rank: 2 },
            t3: { value: 7.94, rank: 4 },
            vrank: { value: 23, rank: 3 }
        }
    },
    {
        method: 'Pgvector-HNSW',
        metrics: {
            t0: { value: 6727.25, rank: 4 },
            recall: { value: 0.257, rank: 6 },
            latency: { value: 0.0020, rank: 1 },
            qps: { value: 1963.25, rank: 1 },
            t1: { value: 5207.49, rank: 6 },
            t2: { value: 3079.13, rank: 5 },
            t3: { value: 7.82, rank: 3 },
            vrank: { value: 26, rank: 4 }
        }
    },
    {
        method: 'Qdrant-HNSW',
        metrics: {
            t0: { value: null, rank: 4 },
            recall: { value: 0.455, rank: 5 },
            latency: { value: 0.0200, rank: 2 },
            qps: { value: 51.17, rank: 3 },
            t1: { value: 2399.00, rank: 4 },
            t2: { value: 5720.56, rank: 4 },
            t3: { value: 11.12, rank: 6 },
            vrank: { value: 28, rank: 5 }
        }
    },
    {
        method: 'Qdrant-HNSW*',
        metrics: {
            t0: { value: null, rank: 4 },
            recall: { value: 0.995, rank: 1 },
            latency: { value: 0.0250, rank: 3 },
            qps: { value: 47.78, rank: 4 },
            t1: { value: 2523.77, rank: 5 },
            t2: { value: 10823.20, rank: 6 },
            t3: { value: 10.12, rank: 5 },
            vrank: { value: 28, rank: 5 }
        }
    }
];

const numberFormats = {
    default: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    latency: new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
    recall: new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    vrank: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
};

let currentSort = { key: 'vrank', direction: 'asc' };

function formatValue(metricKey, rawValue) {
    if (rawValue === null || typeof rawValue === 'undefined') {
        return '—';
    }

    if (metricKey === 'vrank') {
        return numberFormats.vrank.format(rawValue);
    }

    if (metricKey === 'recall') {
        return numberFormats.recall.format(rawValue);
    }

    if (metricKey === 'latency') {
        return numberFormats.latency.format(rawValue);
    }

    const formatter = numberFormats.default;
    return formatter.format(rawValue);
}

function renderHeader() {
    const head = document.getElementById('leaderboard-head');
    const row = document.createElement('tr');

    metrics.forEach((metric) => {
        const th = document.createElement('th');
        th.textContent = metric.label;
        if (metric.sortable) {
            th.addEventListener('click', () => handleSort(metric.key));
            if (currentSort.key === metric.key) {
                th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        }
        row.appendChild(th);
    });

    head.innerHTML = '';
    head.appendChild(row);
}

function getSortValue(row, key) {
    if (key === 'method') {
        return row.method;
    }

    const metric = row.metrics[key];
    if (!metric) {
        return Number.POSITIVE_INFINITY;
    }

    if (metric.value === null) {
        return Number.POSITIVE_INFINITY;
    }

    return metric.value;
}

function renderBody() {
    const body = document.getElementById('leaderboard-body');
    const sorted = [...leaderboardData].sort((a, b) => {
        const aVal = getSortValue(a, currentSort.key);
        const bVal = getSortValue(b, currentSort.key);

        if (aVal === bVal) {
            return 0;
        }

        const directionFactor = currentSort.direction === 'asc' ? 1 : -1;
        return aVal > bVal ? directionFactor : -directionFactor;
    });

    body.innerHTML = '';

    sorted.forEach((rowData) => {
        const tr = document.createElement('tr');

        metrics.forEach((metric) => {
            const td = document.createElement('td');

            if (metric.key === 'method') {
                td.textContent = rowData.method;
                td.classList.add('method-cell');
                tr.appendChild(td);
                return;
            }

            const metricData = rowData.metrics[metric.key];
            if (!metricData) {
                td.textContent = '—';
                tr.appendChild(td);
                return;
            }

            const valueText = formatValue(metric.key, metricData.value);
            const valueEl = document.createElement('div');
            valueEl.textContent = valueText;
            td.appendChild(valueEl);

            const rankEl = document.createElement('div');
            rankEl.className = 'rank-pill';
            rankEl.textContent = `#${metricData.rank}`;
            td.appendChild(rankEl);

            if (metricData.rank === 1) {
                td.classList.add('best');
            }

            tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}

function handleSort(key) {
    if (currentSort.key === key) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort = { key, direction: 'asc' };
    }

    renderHeader();
    renderBody();
}

function initLeaderboard() {
    renderHeader();
    renderBody();
}

initLeaderboard();
