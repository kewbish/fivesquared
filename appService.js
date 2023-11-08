const oracledb = require("oracledb");
const loadEnvFile = require("./utils/envUtil");

const envVariables = loadEnvFile("./.env");

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
  user: envVariables.ORACLE_USER,
  password: envVariables.ORACLE_PASS,
  connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
};

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    return await action(connection);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
  return await withOracleDB(async (connection) => {
    return true;
  }).catch(() => {
    return false;
  });
}

async function fetchDemotableFromDb() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT * FROM DEMOTABLE");
    return result.rows;
  }).catch(() => {
    return [];
  });
}

async function initiateDemotable() {
  return await withOracleDB(async (connection) => {
    try {
      await connection.execute(`DROP TABLE DEMOTABLE`);
    } catch (err) {
      console.log("Table might not exist, proceeding to create...");
    }

    const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
    return true;
  }).catch(() => {
    return false;
  });
}

async function insertDemotable(id, name) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
      [id, name],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function updateNameDemotable(oldName, newName) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
      [newName, oldName],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function countDemotable() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT Count(*) FROM DEMOTABLE");
    return result.rows[0][0];
  }).catch(() => {
    return -1;
  });
}

async function verifyLogin(username, password) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT username FROM AppUser WHERE username = :username AND password = :password`,
      [username, password],
      { autoCommit: true }
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null;
    }

    return result.rows;
  }).catch(() => {
    return [];
  });
}

async function getPosts() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT p.*, ap.title, to_clob(p.image_url) FROM Post p, ArtPiece ap WHERE p.piece_id = ap.piece_id"
    );
    oracledb.fetchAsString = [oracledb.CLOB];
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[3],
      age_restricted: row[4],
      username: row[5],
      // image_url: row[9],
      piece_id: row[8],
    }));
  }).catch(() => {
    return [];
  });
}

async function getPostLikes(post_id) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `SELECT COUNT(*) FROM LikesPost WHERE post_id = :postId`,
        [post_id]
    );
    return result.rows[0][0];
  }).catch(() => {
    return false;
  });
}

async function likePost(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
        `INSERT INTO LikesPost
         VALUES (:username, :postId)`,
        [body["username"], body["post_id"]],
        {autoCommit: true}
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function unlikePost(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
        `DELETE
         FROM LikesPost
         WHERE username = :username
           AND post_id = :postId`,
        [body["username"], body["post_id"]],
        {autoCommit: true}
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function createPost(body) {
  if (
    // !("image_url" in body) ||
    !("username" in body) ||
    !("piece_id" in body)
  ) {
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT max(post_id) FROM Post");
    const id = result.rows[0][0] + 1;
    const insert = await connection.execute(
      `INSERT INTO Post VALUES (:postId, :text, :num_likes, :datetime, :age_restricted, :username, :piece_id, utl_raw.cast_to_raw(:image_url))`,
      {
        postId: id,
        text: body["text"] || null,
        num_likes: 0,
        datetime: new Date(),
        age_restricted: body["age_restricted"] || 0,
        username: body["username"],
        piece_id: body["piece_id"],
        image_url: body["image_url"],
      },
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function getComments(post_id) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT * FROM CommentPost WHERE post_id = :postId`,
      [post_id]
    );
    return result.rows.map((row) => ({
      comment_id: row[0],
      text: row[1],
      num_likes: row[2],
      datetime: row[3],
      age_restricted: row[4],
      username: row[5],
      post_id: row[6],
    }));
  }).catch(() => {
    return [];
  });
}

async function getCommentLikes(post_id, comment_id) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `SELECT COUNT(*) FROM LikesComment WHERE post_id = :postId AND comment_id = :commentId`,
        [post_id, comment_id]
    );
    return result.rows[0][0];
  }).catch(() => {
    return false;
  });
}

async function likeComment(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `INSERT INTO LikesComment VALUES (:username, :postId, :commentId)`,
      [body["username"], body["post_id"], body["comment_id"]],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function unlikeComment(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `DELETE FROM LikesComment WHERE username = :username AND post_id = :postId AND comment_id = :commentId`,
      [body["username"], body["post_id"], body["comment_id"]],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function createComment(post_id, body) {
  console.log(body);
  if (
    !("username" in body) ||
    !("post_id" in body) ||
    body["post_id"] !== post_id
  ) {
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT max(comment_id) FROM CommentPost WHERE post_id = :postId`,
      [post_id]
    );
    const id = result.rows[0][0] + 1;
    console.log(id);
    const insert = await connection.execute(
      `INSERT INTO CommentPost VALUES (:comment_id, :text, :num_likes, :datetime, :age_restricted, :username, :post_id)`,
      [
        id,
        body["text"] || null,
        0,
        new Date(),
        body["age_restricted"] || 0,
        body["username"],
        post_id,
      ],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

module.exports = {
  testOracleConnection,
  getPosts,
  getPostLikes,
  likePost,
  unlikePost,
  createPost,
  getComments,
  getCommentLikes,
  likeComment,
  unlikeComment,
  createComment,
  verifyLogin,
};
