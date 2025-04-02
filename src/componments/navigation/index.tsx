import { SideNavigation } from "@cloudscape-design/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();

  const [activeHref, setActiveHref] = useState(
    window.location.pathname ?? "/reviewList"
  );
  return (
    <SideNavigation
      activeHref={activeHref}
      header={{ href: "/reviewList", text: "Navigation" }}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          setActiveHref(event.detail.href);
          navigate(event.detail.href);
        }
      }}
      items={[
        { type: "link", text: "Review List", href: "/reviewList" },
        // { type: "divider" },
        { type: "link", text: "Review Files", href: "/reviewFiles" },
      ]}
    />
  );
};

export default Navigation;
