import {
  Table,
  Box,
  SpaceBetween,
  Header,
  Pagination,
  CollectionPreferences,
  Link,
  Alert,
  ContentLayout,
  CollectionPreferencesProps,
  NonCancelableCustomEvent,
  Select,
  FormField,
  Input,
  Button,
  Badge,
  Icon,
} from "@cloudscape-design/components";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./table-select.scss";
import { getQueryVariable } from "../../tools/tool";
import { BACKEND_API_KEY, BACKEND_URL } from "../../tools/const";

const ReviewList = () => {
  // You can set data by props
  const [showTips, setShowTips] = useState(true);

  const [dataList, setDataList] = useState([] as any[]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [filterProjectInput, setFilterProjectInput] = useState(
    getQueryVariable("project") || ""
  );
  const [filterBranchInput, setFilterBranchInput] = useState(
    getQueryVariable("branch") || ""
  );
  const [filterCommitInput, setFilterCommitInput] = useState(
    getQueryVariable("commit_id") || ""
  );
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [selectScanScop, setSelectScanScop] = useState(null as any);
  const currentPageIndexRef = useRef(currentPageIndex);
  const pageSizeRef = useRef(pageSize);
  const filterProjectInputRef = useRef(filterProjectInput);
  const filterBranchInputRef = useRef(filterBranchInput);
  const selectScanScopRef = useRef(selectScanScop?.value.trim());
  const filterCommitInputRef = useRef(filterCommitInput);

  const navigate = useNavigate();

  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex;
    pageSizeRef.current = pageSize;
    filterProjectInputRef.current = filterProjectInput;
    filterBranchInputRef.current = filterBranchInput;
    selectScanScopRef.current = selectScanScop?.value.trim();
    filterCommitInputRef.current = filterCommitInput;
  }, [
    currentPageIndex,
    pageSize,
    filterProjectInput,
    filterBranchInput,
    selectScanScop,
    filterCommitInput,
  ]);

  useEffect(() => {
    if (!window.location.pathname || window.location.pathname === "/") {
      navigate("/reviewList", { replace: true });
    }
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const interval = setInterval(getPageData, 30000); // 每 30 秒调用一次 getPageData
    return () => clearInterval(interval); // 在组件卸载时清除定时器
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePageData = (
    event: NonCancelableCustomEvent<CollectionPreferencesProps.Preferences<any>>
  ) => {
    setPageSize(event.detail.pageSize || 10);
  };

  const getPageData = async () => {
    setLoadingBtn(true);
    try {
      const respone = await fetch(BACKEND_URL + "getReviewRecords", {
        method: "POST",
        body: JSON.stringify({
          page_index: currentPageIndexRef.current,
          page_size: pageSizeRef.current,
          project: filterProjectInputRef.current,
          branch: filterBranchInputRef.current,
          scan_scope: selectScanScopRef.current,
          commit_id: filterCommitInputRef.current,
          repo_url: "",
        }),
        headers: {
          "X-API-Key": BACKEND_API_KEY,
          "Content-Type": "application/json",
        },
      });
      const result = await respone.json();
      const dataResult = getServerDataResult(result.data);
      setDataList(dataResult);
      setPageCount(Math.ceil(result.total_records / pageSize));
    } catch (error) {
      console.error("getPageData Error", error);
      setDataList([]);
      setCurrentPageIndex(1);
      setPageCount(1);
    }

    setLoadingBtn(false);
    return;
  };

  const getServerDataResult = (dataList: any[]) => {
    if (!dataList || dataList.length === 0) {
      return [];
    }
    const resultList: any[] = [];
    const keyList = Object.keys(dataList[0]);
    dataList.forEach((itemRow) => {
      const tempRowData: any = {};
      keyList.forEach((itemKey, index) => {
        if (!itemRow[itemKey]) {
          tempRowData[itemRow[itemKey]] = "";
        } else {
          const values = Object.values(itemRow[itemKey]);
          tempRowData[itemKey] = values[0];
        }
      });
      resultList.push(tempRowData);
    });
    return resultList;
  };

  const getTimeConsuming = (
    endTime: string | number | Date,
    startTime: string | number | Date
  ) => {
    const st = new Date(startTime);
    const et = new Date(endTime);
    const reduceTime = et.valueOf() - st.valueOf();
    const hours = Math.floor(reduceTime / 3600000);
    const minutes = Math.floor((reduceTime % 3600000) / 60000);
    const seconds = Math.floor((reduceTime % 60000) / 1000);
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const clickReviewLink = (rowData: any) => {
    navigate("/reviewDetail", {
      replace: false,
      state: rowData,
    });
  };

  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex]);

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header variant="h1" description="All/Filtered code review list.">
            Review List
          </Header>

          {showTips && (
            <Alert
              statusIconAriaLabel="Info"
              dismissible
              onDismiss={() => setShowTips(false)}
            >
              You can select filters below ⬇️
            </Alert>
          )}
        </SpaceBetween>
      }
    >
      <SpaceBetween size="m">
        <Table
          loading={loadingBtn}
          ariaLabels={{
            selectionGroupLabel: "Items selection",
            itemSelectionLabel: ({ selectedItems }, item) => item.review_id,
          }}
          columnDefinitions={[
            {
              id: "review_id",
              header: "Review Id",
              cell: (item) => {
                if (item.task_status === "Completed") {
                  return (
                    // <Link href={"/reviewDetail?review_id=" + item.review_id}>
                    <Link onFollow={() => clickReviewLink(item)}>
                      {item.review_id}
                    </Link>
                  );
                }
                return item.review_id;
              },
              isRowHeader: true,
            },
            {
              id: "task_status",
              header: "Task status",
              minWidth: 130,
              cell: (item) => {
                if (item.task_status === "Completed") {
                  return (
                    <div style={{ color: "#037f0c" }}>
                      <Icon name="status-positive"></Icon>
                      &nbsp;
                      <span>{item.task_status}</span>
                    </div>
                  );
                }
                if (item.task_status === "InProgress LLM") {
                  return (
                    <div style={{ color: "#414d5c" }}>
                      <Icon name="status-pending"></Icon>
                      &nbsp;
                      <span>{item.task_status}</span>
                    </div>
                  );
                }
                return (
                  <div style={{ color: "#0972d3" }}>
                    <Icon name="status-info"></Icon>
                    &nbsp;
                    <span>{item.task_status}</span>
                  </div>
                );
              },
            },
            {
              id: "min_score",
              header: "Min score",
              cell: (item) => item.min_score,
              minWidth: 160,
            },
            {
              id: "avg_score",
              header: "Avg score",
              cell: (item) => item.avg_score,
              minWidth: 160,
            },
            {
              id: "max_score",
              header: "Max score",
              cell: (item) => item.max_score,
              minWidth: 160,
            },
            {
              id: "project",
              header: "Project",
              cell: (item) => item.project,
              minWidth: 160,
            },

            {
              id: "scan_scope",
              header: "Scan scope",
              width: 120,
              cell: (item) => {
                if (
                  item.scan_scope &&
                  item.scan_scope.toUpperCase() === "ALL"
                ) {
                  return <Badge color="blue">ALL</Badge>;
                }
                return <Badge color="grey">DIFF</Badge>;
              },
            },
            {
              id: "file_done_num",
              header: "File done/File Num",
              cell: (item) => {
                if (
                  item.file_done === item.file_num &&
                  item.task_status === "Completed"
                ) {
                  return (
                    <span
                      style={{ color: "#037f0c" }}
                    >{`${item.file_done} / ${item.file_num}`}</span>
                  );
                }
                return <span>{`${item.file_done} / ${item.file_num}`}</span>;
              },
            },
            {
              id: "branch",
              header: "Branch",
              cell: (item) => item.branch,
              width: 100,
            },
            {
              id: "repo_url",
              header: "Repo URL",
              cell: (item) => item.repo_url,
              minWidth: 220,
            },
            {
              id: "commit_id",
              header: "Commit Id",
              cell: (item) => item.commit_id,
            },
            {
              id: "time_consuming",
              header: "Time consuming",
              cell: (item) => getTimeConsuming(item.update_at, item.created_at),
            },
            {
              id: "created_at",
              header: "Create at",
              cell: (item) => item.created_at.split(".")[0],
            },
            {
              id: "update_at",
              header: "Update at",
              cell: (item) => item.update_at.split(".")[0],
            },
          ]}
          columnDisplay={[
            { id: "review_id", visible: true },
            { id: "task_status", visible: true },
            { id: "min_score", visible: true },
            { id: "avg_score", visible: true },
            { id: "max_score", visible: true },
            { id: "project", visible: true },
            { id: "scan_scope", visible: true },
            { id: "file_done_num", visible: true },
            { id: "branch", visible: true },
            { id: "repo_url", visible: true },
            { id: "commit_id", visible: true },
            { id: "time_consuming", visible: true },
            { id: "created_at", visible: true },
            { id: "update_at", visible: true },
          ]}
          items={dataList}
          loadingText="Loading resources"
          trackBy="review_id"
          stickyHeader
          resizableColumns
          empty={
            <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No resources</b>
              </SpaceBetween>
            </Box>
          }
          filter={
            <div className="input-container">
              <div className="input-select-filter">
                <FormField label="Project">
                  <Input
                    data-testid="project-filter"
                    type="search"
                    value={filterProjectInput}
                    onChange={(event) => {
                      setFilterProjectInput(event.detail.value);
                    }}
                    ariaLabel="Find project"
                    placeholder="Find project"
                    clearAriaLabel="clear"
                  />
                </FormField>
              </div>
              <div className="select-filter">
                <FormField label="Scan scope">
                  <Select
                    data-testid="scan-filter"
                    options={[
                      {
                        label: "-",
                        value: "",
                      },
                      {
                        label: "ALL",
                        value: "ALL",
                      },
                      {
                        label: "DIFF",
                        value: "DIFF",
                      },
                    ]}
                    selectedAriaLabel="Selected"
                    selectedOption={selectScanScop}
                    onChange={(event) => {
                      setSelectScanScop(event.detail.selectedOption);
                    }}
                    expandToViewport={true}
                  />
                </FormField>
              </div>
              <div className="input-select-filter">
                <FormField label="Branch">
                  <Input
                    data-testid="branch-filter"
                    type="search"
                    value={filterBranchInput}
                    onChange={(event) => {
                      setFilterBranchInput(event.detail.value);
                    }}
                    ariaLabel="Find branch"
                    placeholder="Find branch"
                    clearAriaLabel="clear"
                  />
                </FormField>
              </div>
              <div className="input-select-filter">
                <FormField label="Commit Id">
                  <Input
                    data-testid="commit-filter"
                    type="search"
                    value={filterCommitInput}
                    onChange={(event) => {
                      setFilterCommitInput(event.detail.value);
                    }}
                    ariaLabel="Find commit"
                    placeholder="Find commit"
                    clearAriaLabel="clear"
                  />
                </FormField>
              </div>
              <div aria-live="polite">
                <Button
                  iconName="search"
                  loading={loadingBtn}
                  onClick={getPageData}
                ></Button>
              </div>
            </div>
          }
          pagination={
            <Pagination
              currentPageIndex={currentPageIndex}
              pagesCount={pageCount}
              onChange={({ detail }) =>
                setCurrentPageIndex(detail.currentPageIndex)
              }
            />
          }
          preferences={
            <CollectionPreferences
              title="Preferences"
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              preferences={{
                pageSize: pageSize,
                contentDisplay: [
                  { id: "review_id", visible: true },
                  { id: "task_status", visible: true },
                  { id: "project", visible: true },
                  { id: "scan_scope", visible: true },
                  { id: "file_done_num", visible: true },
                  { id: "branch", visible: true },
                  { id: "repo_url", visible: true },
                  { id: "commit_id", visible: true },
                  { id: "time_consuming", visible: true },
                  { id: "created_at", visible: true },
                  { id: "update_at", visible: true },
                ],
              }}
              pageSizePreference={{
                title: "Page size",
                options: [
                  { value: 10, label: "10 resources" },
                  { value: 20, label: "20 resources" },
                  { value: 50, label: "50 resources" },
                  { value: 100, label: "100 resources" },
                ],
              }}
              contentDisplayPreference={{
                options: [
                  {
                    id: "review_id",
                    label: "Review id",
                    alwaysVisible: true,
                  },
                  {
                    id: "task_status",
                    label: "Task status",
                  },
                  {
                    id: "project",
                    label: "Project",
                  },

                  {
                    id: "scan_scope",
                    label: "Scan scope",
                  },
                  {
                    id: "file_done_num",
                    label: "File done/File num",
                  },
                  {
                    id: "branch",
                    label: "Branch",
                  },
                  {
                    id: "repo_url",
                    label: "Repo URL",
                  },
                  {
                    id: "commit_id",
                    label: "Commit Id",
                  },
                  {
                    id: "time_consuming",
                    label: "Time consuming",
                  },
                  {
                    id: "created_at",
                    label: "Create at",
                  },
                  {
                    id: "update_at",
                    label: "Update at",
                  },
                ],
              }}
              stickyColumnsPreference={{
                firstColumns: {
                  title: "Stick first column(s)",
                  description:
                    "Keep the first column(s) visible while horizontally scrolling the table content.",
                  options: [
                    { label: "None", value: 0 },
                    { label: "First column", value: 1 },
                    { label: "First two columns", value: 2 },
                  ],
                },
                lastColumns: {
                  title: "Stick last column",
                  description:
                    "Keep the last column visible while horizontally scrolling the table content.",
                  options: [
                    { label: "None", value: 0 },
                    { label: "Last column", value: 1 },
                  ],
                },
              }}
              onConfirm={(e) => {
                changePageData(e);
              }}
            />
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
};

export default ReviewList;
