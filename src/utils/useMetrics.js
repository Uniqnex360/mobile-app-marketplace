// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import dayjs from "dayjs";

// export const useMetrics = ({
//   userId,
//   targetDate = dayjs(),
//   preset,
//   marketplaceId,
//   brandId,
//   productId,
//   manufacturerName,
//   fulfillmentChannel,
//   startDate,
//   endDate,
// }) => {
//   const [data, setData] = useState({
//     metrics: {},
//     previous: {},
//     difference: {},
//     bindGraph: [],
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const latestRequestRef = useRef(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       const requestId = ++latestRequestRef.current;

//       try {
//         const payload = {
//           user_id: userId,
//           target_date: targetDate.format("DD/MM/YYYY"),
//           preset,
//           marketplace_id: marketplaceId,
//           brand_id: brandId,
//           product_id: productId,
//           manufacturer_name: manufacturerName,
//           fulfillment_channel: fulfillmentChannel,
//         };

//         if (startDate) payload.start_date = startDate.format("DD/MM/YYYY");
//         if (endDate) payload.end_date = endDate.format("DD/MM/YYYY");

//         const response = await axios.post(
//           `${process.env.REACT_APP_IP}get_metrics_by_date_range/`,
//           payload
//         );

//         if (requestId === latestRequestRef.current) {
//           const resData = response.data.data;
//           setData({
//             metrics: resData.targeted || {},
//             previous: resData.previous || {},
//             difference: resData.difference || {},
//             bindGraph: Object.entries(resData.graph_data || {}).map(([rawDate, values]) => ({
//               date: rawDate,
//               fullDate: rawDate,
//               gross_revenue: values.gross_revenue,
//             })),
//           });
//         }
//       } catch (err) {
//         if (requestId === latestRequestRef.current) setError(err);
//       } finally {
//         if (requestId === latestRequestRef.current) setLoading(false);
//       }
//     };

//     fetchData();
//   }, [userId, targetDate, preset, marketplaceId, brandId, productId, manufacturerName, fulfillmentChannel, startDate, endDate]);

//   return { data, loading, error };
// };
