import React from "react";
import AppsIcon from "@mui/icons-material/Apps";

 export const useEnhancedCategories = (categories=[]) => {
    return React.useMemo(()=>{
return [
      {
        id: "all",
        name: "All Channels",
        icon: <AppsIcon fontSize="small" sx={{ height: "13px" }} />,
      },
      ...categories,
    ];
  }, [categories]);
}