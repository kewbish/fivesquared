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

async function getPosts() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT p.*, ap.title FROM Post p, ArtPiece ap WHERE p.piece_id = ap.piece_id"
    );
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      image_url: row[2],
      num_likes: row[3],
      datetime: row[4],
      age_restricted: row[5],
      username: row[6],
      piece_id: row[8],
    }));
  }).catch(() => {
    return [];
  });
}

async function likePost(post_id) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `UPDATE Post SET num_likes = num_likes + 1 WHERE post_id = :postId`,
      [post_id],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function verifyLogin(username, password) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(`SELECT username FROM AppUser WHERE username = :username AND password = :password`,
      [username, password],
      { autoCommit: true });
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
      `INSERT INTO Post VALUES (:postId, :text, :image_url, :num_likes, :datetime, :age_restricted, :username, :piece_id)`,
      [
        id,
        body["text"] || null,
        body["image_url"],
        0,
        new Date(),
        body["age_restricted"] || 0,
        body["username"],
        body["piece_id"],
      ],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function getComments(post_id) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(`SELECT * FROM CommentPost WHERE post_id = :postId`,
        [post_id],
        { autoCommit: true});
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

async function likeComment(post_id, comment_id) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `UPDATE CommentPost SET num_likes = num_likes + 1 WHERE post_id = :postId AND comment_id = :commentId`,
      [post_id, comment_id],
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
    const result = await connection.execute(`SELECT max(comment_id) FROM CommentPost WHERE post_id = :postId`,
        [post_id]);
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
  likePost,
  createPost,
  getComments,
  likeComment,
  createComment,
  verifyLogin,
};
