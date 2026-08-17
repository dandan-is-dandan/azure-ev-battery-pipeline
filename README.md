# Azure EV Battery Pipeline

Azure 기반 **실시간 EV 배터리 이상 탐지 및 모니터링 데이터 파이프라인**

**2026.05 · Team Project · Data Engineering / Azure SQL DB / Dashboard**

---

## Overview

BMW 전기차 주행 데이터와 NASA 배터리 데이터를 활용해
EV 배터리 상태를 실시간으로 수집·처리하고 이상 징후를 탐지하는 시스템을 구축했습니다.

센서 데이터는 Azure IoT Hub를 통해 수집하고 Stream Analytics에서 실시간 처리한 뒤,
Azure SQL Database에 저장하여 Functions API와 Web Dashboard에서 조회할 수 있도록 구성했습니다.

---

## Data

### BMW Trip Data

BMW EV 주행 데이터를 기반으로 차량의 전압, 전류, 온도 및 주행 관련 데이터를 활용했습니다.

* EV 주행 센서 데이터 기반 Feature 구성
* 차량 모델별 배터리 상태 데이터 처리
* Python Simulator 입력 데이터로 활용
* 실시간 Streaming Data 형태로 변환하여 IoT Hub 전송

### NASA Battery Data

NASA Battery Dataset을 활용해 배터리 이상 특성을 분석하고,
배터리 상태 판단에 활용되는 주요 Feature와 가중치 설정에 참고했습니다.

---

## Tech Stack

**Cloud / Data**
`Azure IoT Hub` `Azure Stream Analytics` `Azure SQL Database`
`Azure Functions` `Azure Machine Learning`

**Infrastructure**
`Bicep`

**Development**
`Python` `SQL` `JavaScript` `HTML` `CSS`

**Data**
`BMW Trip Data` `NASA Battery Data`

---

## Architecture

<p align="center">
  <img src="./docs/architecture.png" width="900">
</p>

`Python Simulator`
→ `Azure IoT Hub`
→ `Azure Stream Analytics`
→ `Azure SQL Database`
→ `Azure Functions API`
→ `Web Dashboard`

---

## My Role

**Data Engineering · Azure SQL DB · Dashboard**

* BMW 기반 EV 센서 데이터 전처리 및 Streaming Data 구조 구성
* Azure Stream Analytics 기반 실시간 데이터 처리
* Azure SQL Database Schema 및 조회 구조 설계
* 차량 상태 · BSI · 이상 이벤트 데이터 저장 구조 구성
* Azure Functions API와 Dashboard 데이터 연동
* 차량 상태 · BSI · 이상 이벤트 Web Dashboard 구현
* Bicep 기반 Azure Infrastructure 구성

---

## Key Features

* BMW 기반 EV 주행 센서 데이터 실시간 Streaming
* NASA 배터리 데이터를 활용한 이상 판단 Feature 설계
* 배터리 상태를 `NORMAL / WARNING / CRITICAL` 단계로 분류
* 차량별 상태 및 이상 이벤트 Azure SQL 저장
* Azure Functions 기반 데이터 조회 API
* 차량 상태 · BSI · 이상 이벤트 Dashboard 시각화
* Bicep 기반 Azure Resource 코드화

---

## Repository Structure

```text
.
├── Python_Simulator/
│   └── EV 센서 데이터 생성 및 IoT Hub 전송
│
├── ev-backend/
│   └── Dashboard 데이터 조회 API
│
├── ev-dashboard/
│   └── 차량 상태 및 이상 탐지 결과 시각화
│
├── infrastructure_Github/
│   └── Bicep 기반 Azure Infrastructure
│
├── model_endpoint_deployment/
│   └── Azure ML Model Endpoint 배포 및 Inference
│
├── docs/
│   └── architecture.png
│
├── .gitignore
└── README.md
```

---

## Project Info

| 항목      | 내용                                          |
| ------- | ------------------------------------------- |
| Project | Microsoft Data School 4기 1차 프로젝트            |
| Period  | 2026.05                                     |
| Type    | Team Project                                |
| Role    | Data Engineering · Azure SQL DB · Dashboard |
| Data    | BMW EV Trip Data · NASA Battery Data        |
