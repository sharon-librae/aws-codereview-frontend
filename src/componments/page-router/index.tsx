import { BrowserRouter, Route, Routes } from "react-router-dom";
import PageLayout from "../page-layout";
import ReviewList from "../review-list";
import ReviewDetail from "../review-detail";
import ReviewFiles from "../review-files";
const PageRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout content={<ReviewList />} />} />
        <Route
          path="/reviewList"
          element={<PageLayout content={<ReviewList />} />}
        />
        <Route
          path="/reviewDetail"
          element={<PageLayout content={<ReviewDetail />} />}
        />
        <Route
          path="/reviewFiles"
          element={<PageLayout content={<ReviewFiles />} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default PageRouter;
