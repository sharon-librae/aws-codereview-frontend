import {
  ContentLayout,
  SpaceBetween,
  Header,
  Alert,
  BreadcrumbGroup,
  Spinner,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { alertMsg, getQueryVariable } from "../../tools/tool";
import { BACKEND_API_KEY, BACKEND_URL } from "../../tools/const";
import { useLocation } from "react-router-dom";

const ReviewDetail = () => {
  const paramState = useLocation();
  const [showTips, setShowTips] = useState(paramState && paramState.state);
  const [loading, setLoading] = useState(false);

  const [pageResult, setPageResult] = useState({} as any);

  const reviewId = getQueryVariable("review_id") || paramState.state.review_id;

  const getPageData = async () => {
    if (!reviewId) {
      return;
    }
    setLoading(true);
    try {
      const respone = await fetch(BACKEND_URL + "getReviewResult", {
        method: "POST",
        body: JSON.stringify({
          review_id: reviewId,
        }),
        headers: {
          "X-API-Key": BACKEND_API_KEY,
          "Content-Type": "application/json",
        },
      });
      const result = await respone.json();
      if (result && result.data && result.data.review_result) {
        result.data.review_result.reverse();
        setPageResult(result.data);
      }
    } catch (error) {
      console.error("getPageData Error", error);
      setPageResult({});
      alertMsg("Load Data Error", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if ((!paramState || !paramState.state) && !reviewId) {
    return <></>;
  }
  return (
    <>
      {loading && <Spinner size="large" />}
      {!loading && (
        <ContentLayout
          header={
            <SpaceBetween size="m">
              <Header variant="h1">
                <BreadcrumbGroup
                  items={[
                    { text: "Code review portal", href: "/" },
                    { text: "Review detail", href: "#" },
                  ]}
                  ariaLabel="Breadcrumbs"
                />
                Commit Id: {paramState.state.commit_id}
              </Header>

              {showTips && (
                <Alert
                  statusIconAriaLabel="Info"
                  dismissible
                  onDismiss={() => setShowTips(false)}
                  header="Commit info"
                >
                  Branch: {paramState.state.branch}
                  <br></br>
                  Project: {paramState.state.project}
                  <br></br>
                  Scan scope: {paramState.state.scan_scope}
                  <br></br>
                  Create at: {paramState.state.created_at.split(".")[0]}
                  <br></br>
                  Update at: {paramState.state.update_at.split(".")[0]}
                </Alert>
              )}
            </SpaceBetween>
          }
        >
          <SpaceBetween size={"xl"}>
            {pageResult &&
              pageResult.review_result &&
              pageResult.review_result.length > 0 &&
              pageResult.review_result.map((item: any, key: any) => {
                return (
                  <div key={"pageItem" + key}>
                    <label
                      style={{
                        boxSizing: "border-box",
                        color: key === 0 ? "#fff" : "#000716",
                        fontSize: 14,
                        fontWeight: 700,
                        hyphens: "none",
                        overflowWrap: "break-word",
                        textSizeAdjust: "100% inherit",
                      }}
                    >
                      {`Report ${key + 1}`}
                    </label>
                    <iframe
                      src={item}
                      title={`Review deteil-${key}`}
                      style={{ width: "100%", minHeight: "800px" }}
                      frameBorder={0}
                    ></iframe>
                  </div>
                );
              })}
          </SpaceBetween>
        </ContentLayout>
      )}
    </>
  );
};
export default ReviewDetail;
