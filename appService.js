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
    const result = await connection.execute("SELECT * FROM Post");
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      image_url: row[2],
      num_likes: row[3],
      datetime: row[4],
      age_restricted: row[5],
      username: row[6],
      piece_id: row[7],
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

module.exports = {
  testOracleConnection,
  getPosts,
  likePost,
  getComments,
  likeComment,
};

