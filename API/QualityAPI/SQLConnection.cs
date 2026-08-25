using QualityAPI.Helper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
namespace QualityAPI
{
    public class SQLConnection
    {
        private string extCon = "";
        string conString = "";
        public SqlConnection SqlCon;
        public SqlCommand SqlCmd;
        public SqlDataAdapter SQLDA;
        public DataSet SQLDataset;
        General generalHelper = new General();


        public bool HasConnection()
        {
            try
            {
                //extCon = "User ID=DRONAADMIN;Password=admin#123;Integrated Security=False;User Instance=False";
                conString = ConfigurationManager.ConnectionStrings["AD"].ConnectionString;// + extCon;
                SqlCon = new SqlConnection(conString);
                SqlCon.Open();
                SqlCon.Close();
                return true;
            }
            catch (Exception ex)
            {
                //genobj.addExceptionLog(ex, "SAP_Production_Book Service ", "HasConnection()");
                //help.WriteLog("_________________________________________________", "logFile");
                //help.WriteLog("(Exception) : Method :HasConnection()  MESSAGE :" + ex.Message, "logFile");
                if (SqlCon.State == ConnectionState.Open)
                {
                    SqlCon.Close();
                }
                return false;
            }
        }

        public void RunQuery(string Query)
        {
            try
            {
                //extCon = "User ID=DRONAADMIN;Password=admin#123;Integrated Security=False;User Instance=False";
                conString = ConfigurationManager.ConnectionStrings["AD"].ConnectionString;// + extCon;
                SqlCon = new SqlConnection(conString);

                SqlCon.Open();
                SqlCmd = new SqlCommand(Query, SqlCon);

                //Load sql records for datagrid
                SQLDA = new SqlDataAdapter(SqlCmd);
                // creates new data adapter
                SQLDataset = new DataSet();
                //creates instance of dataset
                SQLDA.Fill(SQLDataset);
                //Fills dataset with the data

                SqlCon.Close();
            }
            catch (Exception ex)
            {
                //    genobj.addExceptionLog(ex, "SAP_Production_Book Service ", "RunQuery()");
                //    help.WriteLog("_________________________________________________", "logFile");
                //    help.WriteLog("(Exception) : Method :RunQuery()  MESSAGE :" + ex.Message, "logFile");
                if (SqlCon.State == ConnectionState.Open)
                {
                    SqlCon.Close();
                }
            }

        }


        public void IUDTable(string query)
        {
            try
            {
                //extCon = "User ID=DRONAADMIN;Password=admin#123;Integrated Security=False;User Instance=False";
                //extCon = " Integrated Security=False;User Instance=False";
                conString = ConfigurationManager.ConnectionStrings["AD"].ConnectionString;// + extCon;
                SqlCon = new SqlConnection(conString);

                SqlCon.Open();
                SqlCmd = new SqlCommand(query, SqlCon);
                SqlCmd.ExecuteNonQuery();
                SqlCon.Close();

            }
            catch (Exception ex)
            {
                //genobj.addExceptionLog(ex, "SAP_Production_Book Service ", "IUDTable()");
                //help.WriteLog("_________________________________________________", "logFile");
                //help.WriteLog("(Exception) : Method :IUDTable()  MESSAGE :" + ex.Message, "logFile");
                if (SqlCon.State == ConnectionState.Open)
                {
                    SqlCon.Close();
                }
            }
        }


        public DataSet SQLDataSet(string Query)
        {
            try
            {
                conString = ConfigurationManager.ConnectionStrings["OneD_DB"].ConnectionString;// + extCon;
                SqlCon = new SqlConnection(conString);

                SqlCon.Open();
                SqlCmd = new SqlCommand(Query, SqlCon);

                //Load sql records for datagrid
                SQLDA = new SqlDataAdapter(SqlCmd);
                // creates new data adapter
                SQLDataset = new DataSet();
                //creates instance of dataset
                SQLDA.Fill(SQLDataset);
                //Fills dataset with the data

                SqlCon.Close();
            }
            catch (Exception ex)
            {

                if (SqlCon.State == ConnectionState.Open)
                {
                    SqlCon.Close();
                }
            }
            return SQLDataset;
        }

        
        public DataSet GetDataSet_SQL(string qry, CommandType type, SqlParameter[] inputparm, SqlParameter[] outputparm)
        {
            conString = ConfigurationManager.ConnectionStrings["OneD_DB"].ConnectionString;// + extCon;
            SqlConnection cn = new SqlConnection(conString);
            try
            {
                cn.Open();
                DataSet ds = new DataSet();
                SqlDataAdapter adp = new SqlDataAdapter(qry, cn);

                string timeoutSettings = ConfigurationManager.AppSettings["DBCommandTimeout"];
                int cmdTimeout = -1;
                if (!string.IsNullOrEmpty(timeoutSettings))
                {
                    int.TryParse(timeoutSettings, out cmdTimeout);
                }

                if (cmdTimeout >= 0)
                    adp.SelectCommand.CommandTimeout = cmdTimeout;



                adp.SelectCommand.CommandType = type;
                if (inputparm != null && inputparm.Length > 0)
                {
                    for (int i = 0; i < inputparm.Length; i++)
                    {
                        adp.SelectCommand.Parameters.Add(inputparm[i]).Direction = ParameterDirection.Input;
                    }
                }
                if (outputparm != null && outputparm.Length > 0)
                {
                    for (int i = 0; i < outputparm.Length; i++)
                    {
                        adp.SelectCommand.Parameters.Add(outputparm[i]).Direction = ParameterDirection.Output;
                    }
                }
                adp.Fill(ds);
                cn.Close();
                return ds;
            }
            catch (Exception ex)
            {
                cn.Close();
                generalHelper.addControllerException(ex, "OrderStartController", "ExecuteNonQuery_SQL", 71);
                return null;
            }
            finally
            {
                cn.Close();
            }
        }
    }
}