const User=require("../modal/UserModal")
const Todo= require("../modal/TodoModal")

exports.getAllChildren = async (req, res) => {
    try {
      const { page, limit } = req.query;
  
      const pageNo = Number(page || 1);
      const pageLimit = Number(limit || 10);
      const skip = (pageNo - 1) * pageLimit;
  
      const matcher = { role: "children" };
  
      const children = await User.aggregate([

        { $match: matcher },

        { $sort: { createdAt: -1 } },
  

        { $skip: skip },
        { $limit: pageLimit },
  

        {
          $lookup: {
            from: "todos",          // ✅ FIX
            localField: "_id",
            foreignField: "userId",
            as: "todos"
          }
        },
  
        // 5️⃣ Calculate todo stats
        {
          $addFields: {
            totalTodos: { $size: "$todos" },
            doneTodos: {
              $size: {
                $filter: {
                  input: "$todos",
                  as: "t",
                  cond: { $eq: ["$$t.isDone", true] }
                }
              }
            },
            pendingTodos: {
              $size: {
                $filter: {
                  input: "$todos",
                  as: "t",
                  cond: { $eq: ["$$t.isDone", false] }
                }
              }
            }
          }
        },
  
        // 6️⃣ Remove sensitive / unnecessary fields
        {
          $project: {
            password: 0,
            todos: 0,
            __v: 0
          }
        }
      ]);
  
      const totalDoc = await User.countDocuments(matcher);
  
      res.status(200).json({
        success: true,
        message: "Children fetched successfully",
        data: children,
        pagination: {
          page: pageNo,
          limit: pageLimit,
          total: totalDoc,
          totalPage: Math.ceil(totalDoc / pageLimit)
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };
  