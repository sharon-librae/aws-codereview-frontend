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

const ReviewFiles = () => {
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
  const [filterFilesInput, setFilterFilesInput] = useState(
    getQueryVariable("file") || ""
  );
  const [loadingBtn, setLoadingBtn] = useState(false);

  const currentPageIndexRef = useRef(currentPageIndex);
  const pageSizeRef = useRef(pageSize);
  const filterProjectInputRef = useRef(filterProjectInput);
  const filterBranchInputRef = useRef(filterBranchInput);
  const filterFilesInputRef = useRef(filterFilesInput);

  const navigate = useNavigate();

  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex;
    pageSizeRef.current = pageSize;
    filterProjectInputRef.current = filterProjectInput;
    filterBranchInputRef.current = filterBranchInput;
    filterFilesInputRef.current = filterFilesInput;
  }, [
    currentPageIndex,
    pageSize,
    filterProjectInput,
    filterBranchInput,
    filterFilesInput,
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
      const respone = await fetch(BACKEND_URL + "getFileRecords", {
        method: "POST",
        body: JSON.stringify({
          page_index: currentPageIndexRef.current,
          page_size: pageSizeRef.current,
          project: filterProjectInputRef.current,
          branch: filterBranchInputRef.current,
          file_list: filterFilesInputRef.current,
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

  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex]);

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header variant="h1" description="All/Filtered file review list.">
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
              cell: (item) => item.review_id,
              minWidth: 160,
              isRowHeader: true,
            },
            {
              id: "project_branch_file",
              header: "File Name",
              cell: (item) => item.project_branch_file,
            },
            {
              id: "commit_id",
              header: "Commit Id",
              cell: (item) => item.commit_id,
            },
            {
              id: "review_at",
              header: "Review at",
              cell: (item) => item.review_at.split(".")[0],
            },
            {
              id: "review_result",
              header: "Review result",
              cell: (item) => item.review_result,
              minWidth: 160,
            },
            {
              id: "score",
              header: "Score",
              cell: (item) => item.score,
            },
          ]}
          columnDisplay={[
            { id: "review_id", visible: true },
            { id: "project_branch_file", visible: true },
            { id: "commit_id", visible: true },
            { id: "review_at", visible: true },
            { id: "review_result", visible: true },
            { id: "score", visible: true },
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
                <FormField label="Review File">
                  <Input
                    data-testid="file-filter"
                    type="search"
                    value={filterFilesInput}
                    onChange={(event) => {
                      setFilterFilesInput(event.detail.value);
                    }}
                    ariaLabel="Find file"
                    placeholder="Find file"
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
                  { id: "project_branch_file", visible: true },
                  { id: "commit_id", visible: true },
                  { id: "review_at", visible: true },
                  { id: "review_result", visible: true },
                  { id: "score", visible: true },
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
                    id: "project_branch_file",
                    label: "File Name",
                    alwaysVisible: true,
                  },
                  {
                    id: "commit_id",
                    label: "Commit id",
                  },
                  {
                    id: "review_at",
                    label: "Review at",
                  },

                  {
                    id: "review_result",
                    label: "Review result",
                  },
                  {
                    id: "score",
                    label: "Score",
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

export default ReviewFiles;
